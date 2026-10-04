'use server';

// Server Actions related to auth token lifecycle. These run on the
// server ONLY -- they read/write httpOnly cookies directly via
// next/headers, which browser JS has no access to.

import { cookies } from 'next/headers';
import { ApiEnvelope, ApiError, gatewayClient } from '@/services/gateway-client';
import {
    isRefreshInFlight,
    beginRefresh,
    endRefresh,
    waitForRefresh,
    type RefreshedTokens,
    type RefreshTokenResponse,
} from '@/lib/refresh-lock';
// gatewayClient hits the Gateway directly with an absolute URL.
// Using the browser client here (baseUrl '/api/proxy') would throw,
// since a relative URL has nothing to resolve against on the server.
// It would also be a circular dependency: the proxy route calls this
// action to handle a 401, so this action must NOT call back into the
// proxy route.

interface IRefreshResult {
    success: boolean;
}

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function setRefreshedCookies(cookieStore: CookieStore, tokens: RefreshedTokens) {
    // maxAge is in SECONDS (per the Set-Cookie spec) -- make sure
    // accessTokenExpiresIn from the BE is also in seconds, not ms.
    cookieStore.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: tokens.accessTokenExpiresIn ?? 15 * 60,
    });

    if (tokens.refreshToken) {
        cookieStore.set('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: tokens.refreshTokenExpiresIn ?? 7 * 24 * 60 * 60,
        });
    }
}

export async function refreshAccessTokenAction(): Promise<IRefreshResult> {
    // Someone else's refresh is already in flight -- piggyback on its
    // result instead of starting a new one. Its cookies were set on
    // ITS response, so write the handed-over tokens onto ours too.
    if (isRefreshInFlight()) {
        const tokens = await waitForRefresh();
        if (!tokens) return { success: false };

        setRefreshedCookies(await cookies(), tokens);
        return { success: true };
    }

    beginRefresh();

    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        // No refresh token at all -- user was never logged in, or the
        // cookie already expired/was cleared. Nothing to do.
        if (!refreshToken) {
            endRefresh(null);
            return { success: false };
        }

        // Using postWithResponse (not the plain post) because we need
        // access to response.headers below -- the rotated refresh
        // token comes back via Set-Cookie, NOT in the JSON body.
        const { response, data: envelope } = await gatewayClient.postWithResponse<RefreshTokenResponse>(
            '/api/auth/refresh',
            undefined,
            {
                headers: {
                    Cookie: `refreshToken=${refreshToken}`,
                },
            },
        );

        if (!envelope.success || !envelope.data?.accessToken) {
            endRefresh(null);
            return { success: false };
        }

        // The BE rotates the refresh token on every use (security best
        // practice -- limits the damage if a refresh token is ever
        // stolen). It sends the new one via Set-Cookie rather than the
        // JSON body, so we have to parse it out of the raw header here.
        const setCookies = response.headers.getSetCookie?.() ?? [];
        const rotated = setCookies.find((c) => c.startsWith('refreshToken='));

        const tokens: RefreshedTokens = {
            ...envelope.data,
            refreshToken: rotated?.split(';')[0].split('=')[1],
        };
        setRefreshedCookies(cookieStore, tokens);

        endRefresh(tokens);
        return { success: true };
    } catch (error) {
        // Network failure, Gateway down, etc. Treat as a failed
        // refresh rather than letting the error bubble up -- callers
        // (the proxy route) just need a success/fail signal.
        console.error('Refresh token failed:', error);
        endRefresh(null);
        return { success: false };
    }
}

export interface ILoginPayload {
    email: string;
    password: string;
}

export async function loginAction(payload: ILoginPayload): Promise<ApiEnvelope<null>> {
    try {
        const cookieStore = await cookies();

        // Same pattern as refresh: need response.headers to read the
        // rotated refreshToken from Set-Cookie, so postWithResponse
        // instead of the plain post.
        const { response, data: envelope } = await gatewayClient.postWithResponse<RefreshTokenResponse>(
            '/api/auth/login',
            payload,
        );

        if (!envelope.success || !envelope.data?.accessToken) {
            // Propagate BE's own message (e.g. "Wrong password") as-is,
            // but with data forced to null -- callers of loginAction
            // must never receive a token in the response body.
            return { ...envelope, data: null };
        }

        cookieStore.set('accessToken', envelope.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: envelope?.data?.accessTokenExpiresIn ?? 15 * 60,
        });

        const setCookies = response.headers.getSetCookie?.() ?? [];
        const rotated = setCookies.find((c) => c.startsWith('refreshToken='));

        if (rotated) {
            const newRefreshToken = rotated.split(';')[0].split('=')[1];
            cookieStore.set('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: envelope.data.refreshTokenExpiresIn ?? 7 * 24 * 60 * 60,
            });
        }

        // data: null -- the access token has already been written to
        // an httpOnly cookie above. It must NOT be echoed back here,
        // or it becomes readable by any client-side JS (defeats the
        // whole point of httpOnly).
        return {
            success: envelope.success,
            timestamp: envelope.timestamp,
            message: envelope.message ?? 'Login successful',
            data: null,
        };
    } catch (error) {
        if (error instanceof ApiError && error.payload) {
            return error.payload as ApiEnvelope<null>;
        }
        return {
            success: false,
            timestamp: new Date().toISOString(),
            message: 'Cannot connect to server',
            data: null,
        };
    }
}

export async function logoutAction(): Promise<{ success: boolean }> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // Best-effort: tell the BE to revoke this session (removes the
    // refresh token's row via RefreshTokenService, so it can't be
    // reused even if somehow leaked). If this call fails for any
    // reason (BE down, network error, token already invalid), we
    // still proceed to clear cookies below -- a failed BE call must
    // NEVER leave the user stuck "logged in" on the client while
    // unable to log out.
    try {
        if (accessToken || refreshToken) {
            await gatewayClient.post('/api/auth/logout', undefined, {
                headers: {
                    Cookie: `refreshToken=${refreshToken}`,
                },
            });
        }
    } catch (error) {
        console.error('Logout BE call failed (clearing cookies anyway):', error);
    }

    // Clear both cookies regardless of the BE call's outcome. Setting
    // maxAge: 0 (or using delete) tells the browser to drop the
    // cookie immediately. This is what actually "logs the user out"
    // from the FE's perspective.
    cookieStore.set('accessToken', '', { path: '/', maxAge: 0 });
    cookieStore.set('refreshToken', '', { path: '/', maxAge: 0 });

    return { success: true };
}

interface OAuthTokens {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
}

export async function exchangeOAuthCodeAction(code: string): Promise<{ success: boolean }> {
    try {
        const cookieStore = await cookies();

        // Server-to-server call to the Gateway. The handoff code never
        // reaches this function from the browser's JS -- it comes from
        // the URL query param of a server-rendered page, read below.
        const envelope = await gatewayClient.post<OAuthTokens>('/api/auth/oauth/exchange', { code });

        if (!envelope.success || !envelope.data?.accessToken) {
            return { success: false };
        }

        cookieStore.set('accessToken', envelope.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: envelope?.data?.accessTokenExpiresIn ?? 15 * 60,
        });

        cookieStore.set('refreshToken', envelope.data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: envelope.data.refreshTokenExpiresIn ?? 60 * 60 * 24 * 7,
        });

        return { success: true };
    } catch (error) {
        console.error('OAuth exchange failed:', error);
        return { success: false };
    }
}

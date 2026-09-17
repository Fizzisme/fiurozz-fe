import { NextResponse, type NextRequest } from 'next/server';
import { gatewayClient } from '@/services/gateway-client';
import { isRefreshInFlight, beginRefresh, endRefresh, waitForRefresh } from '@/lib/refresh-lock';

interface RefreshTokenResponse {
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
}

// Routes that a logged-in user shouldn't be able to revisit -- e.g.
// seeing the login form again after already being authenticated.
const AUTH_ONLY_WHEN_LOGGED_OUT = ['/login', '/register', '/forgot-password'];

// Routes that require a valid session -- redirect to /login if missing.
const PROTECTED_PREFIXES = ['/settings', '/profile', '/projects/create', '/projects/preview'];

function isProtectedPath(pathname: string) {
    return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthOnlyPath(pathname: string) {
    return AUTH_ONLY_WHEN_LOGGED_OUT.includes(pathname);
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    let accessToken = req.cookies.get('accessToken')?.value;
    const refreshToken = req.cookies.get('refreshToken')?.value;

    // --- Step 1: try to restore a valid accessToken if missing ---
    let refreshedResponse: NextResponse | null = null;

    if (!accessToken && refreshToken) {
        if (isRefreshInFlight()) {
            await waitForRefresh();
            // Re-read after waiting -- another invocation may have
            // just set it.
            accessToken = req.cookies.get('accessToken')?.value;
        } else {
            beginRefresh();
            try {
                const { response, data: envelope } = await gatewayClient.postWithResponse<RefreshTokenResponse>(
                    '/api/auth/refresh',
                    undefined,
                    { headers: { Cookie: `refreshToken=${refreshToken}` } },
                );

                if (response.ok && envelope.success && envelope.data?.accessToken) {
                    accessToken = envelope.data.accessToken;

                    refreshedResponse = NextResponse.next();
                    refreshedResponse.cookies.set('accessToken', envelope.data.accessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        path: '/',
                        maxAge: envelope.data.accessTokenExpiresIn ?? 15 * 60,
                    });

                    const setCookieHeader = response.headers.get('set-cookie');
                    if (setCookieHeader?.startsWith('refreshToken=')) {
                        const newRefreshToken = setCookieHeader.split(';')[0].split('=')[1];
                        refreshedResponse.cookies.set('refreshToken', newRefreshToken, {
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax',
                            path: '/',
                            maxAge: envelope.data.refreshTokenExpiresIn ?? 7 * 24 * 60 * 60,
                        });
                    }

                    endRefresh(true);
                } else {
                    endRefresh(false);
                }
            } catch {
                endRefresh(false);
            }
        }
    }

    const isLoggedIn = Boolean(accessToken);

    // --- Step 2: route guarding, now that we know the real auth state ---

    // Logged in but trying to view /login, /register, etc. -- send
    // them to their home page instead of showing the form again.
    if (isLoggedIn && isAuthOnlyPath(pathname)) {
        return NextResponse.redirect(new URL('/home', req.url));
    }

    // Not logged in but trying to view a protected page -- send them
    // to /login, remembering where they were headed via ?next=.
    if (!isLoggedIn && isProtectedPath(pathname)) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // No redirect needed -- return the refreshed cookies (if any) or
    // just continue normally.
    return refreshedResponse ?? NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
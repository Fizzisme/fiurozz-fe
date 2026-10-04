import { NextResponse, type NextRequest } from 'next/server';
import { gatewayClient } from '@/services/gateway-client';
import {
    isRefreshInFlight,
    beginRefresh,
    endRefresh,
    waitForRefresh,
    type RefreshedTokens,
    type RefreshTokenResponse,
} from '@/lib/refresh-lock';

function setAuthCookies(res: NextResponse, tokens: RefreshedTokens) {
    res.cookies.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: tokens.accessTokenExpiresIn ?? 15 * 60,
    });

    if (tokens.refreshToken) {
        res.cookies.set('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: tokens.refreshTokenExpiresIn ?? 7 * 24 * 60 * 60,
        });
    }
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
        let tokens: RefreshedTokens | null = null;

        if (isRefreshInFlight()) {
            // req.cookies is this request's original Cookie header, so
            // it never sees what the other invocation set -- take the
            // tokens it hands over instead.
            tokens = await waitForRefresh();
        } else {
            beginRefresh();
            try {
                const { response, data: envelope } = await gatewayClient.postWithResponse<RefreshTokenResponse>(
                    '/api/auth/refresh',
                    undefined,
                    { headers: { Cookie: `refreshToken=${refreshToken}` } },
                );

                if (response.ok && envelope.success && envelope.data?.accessToken) {
                    // The BE may send several Set-Cookie headers, so
                    // find the refreshToken one instead of assuming
                    // it comes first.
                    const rotated = (response.headers.getSetCookie?.() ?? []).find((c) =>
                        c.startsWith('refreshToken='),
                    );
                    tokens = {
                        ...envelope.data,
                        refreshToken: rotated?.split(';')[0].split('=')[1],
                    };
                }
            } catch {
                tokens = null;
            } finally {
                endRefresh(tokens);
            }
        }

        if (tokens) {
            accessToken = tokens.accessToken;
            refreshedResponse = NextResponse.next();
            setAuthCookies(refreshedResponse, tokens);
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
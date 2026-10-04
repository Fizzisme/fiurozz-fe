// Shared refresh mutex, used by BOTH proxy.ts and auth-action.ts.
// Only works correctly because Proxy runs on the Node.js runtime (the
// default in Next 16 -- the `runtime` option is not allowed in Proxy):
// Edge Runtime doesn't guarantee this module-level state persists
// across invocations. This also only dedupes within a single Node
// process; a multi-instance/horizontally-scaled deployment would need
// a distributed lock (e.g. Redis) instead.

// Body of POST /api/auth/refresh and /api/auth/login.
export interface RefreshTokenResponse {
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
}

// What a finished refresh hands to its waiters, so they can write the
// same cookies onto their own response -- a waiter can't see cookies
// set on another invocation's response.
export interface RefreshedTokens extends RefreshTokenResponse {
    // Rotated refresh token from Set-Cookie, if the BE sent one.
    refreshToken?: string;
}

let isRefreshing = false;
let subscribers: ((tokens: RefreshedTokens | null) => void)[] = [];

export function isRefreshInFlight() {
    return isRefreshing;
}

export function beginRefresh() {
    isRefreshing = true;
}

// tokens = null means the refresh failed.
export function endRefresh(tokens: RefreshedTokens | null) {
    subscribers.forEach((cb) => cb(tokens));
    subscribers = [];
    isRefreshing = false;
}

export function waitForRefresh(): Promise<RefreshedTokens | null> {
    return new Promise((resolve) => {
        subscribers.push(resolve);
    });
}

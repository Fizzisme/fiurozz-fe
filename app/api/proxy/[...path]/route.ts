// Catch-all proxy: every request from the browser to '/api/proxy/*'
// lands here. This is the ONLY place that knows the Gateway's real
// URL and holds the access token -- the browser never sees either.
//
// Responsibilities:
//   1. Read the httpOnly accessToken cookie and attach it as
//      Authorization header before forwarding to the Gateway.
//   2. If the Gateway responds 401 (token expired), refresh once and
//      retry the same request -- transparent to the browser.
//   3. Stream the Gateway's response back to the browser unchanged.

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { refreshAccessTokenAction } from '@/actions/auth-action';

const BE_URL = process.env.BE_URL;

async function proxy(req: NextRequest, path: string[]) {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get('accessToken')?.value;

    // path comes from the dynamic [...path] segment, e.g. a request to
    // /api/proxy/auth/login gives path = ['auth', 'login']. search
    // preserves query params (?page=1&limit=10) as-is.
    const targetUrl = `${BE_URL}/${path.join('/')}${req.nextUrl.search}`;

    const forwardHeaders = new Headers();
    const contentType = req.headers.get('content-type');
    if (contentType) forwardHeaders.set('content-type', contentType);
    // Optimistic locking (publish, update, delete): BE reads the project version from If-Match.
    const ifMatch = req.headers.get('if-match');
    if (ifMatch) forwardHeaders.set('if-match', ifMatch);

    // Read the whole request body up-front as raw bytes. This is
    // required (not just convenient) because req.body is a
    // ReadableStream that can only be consumed ONCE -- if the first
    // fetch to the Gateway fails with 401, we need to send the exact
    // same body again on retry, which a stream won't allow.
    // arrayBuffer() also preserves binary data correctly (file
    // uploads, images), unlike reading it as .text().
    const rawBody = req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer();

    // Small helper so the "attach token + fetch" logic isn't
    // duplicated between the first attempt and the post-refresh retry.
    const doFetch = (token?: string) => {
        if (token) forwardHeaders.set('Authorization', `Bearer ${token}`);
        return fetch(targetUrl, { method: req.method, headers: forwardHeaders, body: rawBody });
    };

    let beResponse = await doFetch(accessToken);

    // Gateway says the access token is invalid/expired -> try to get a
    // new one via the refresh token cookie, then retry ONCE. If the
    // refresh itself fails (refresh token also expired/revoked), we
    // give up and let the original 401 flow back to the browser so
    // the client-side code can redirect to /login.
    if (beResponse.status === 401) {
        const refreshResult = await refreshAccessTokenAction();

        if (refreshResult.success) {
            // refreshAccessTokenAction() already wrote the new
            // accessToken cookie -- re-read it here rather than
            // trusting a return value, since the action's job is to
            // manage cookies, not to hand tokens back through JS.
            accessToken = (await cookies()).get('accessToken')?.value;
            beResponse = await doFetch(accessToken);
        }
    }

    // Forward the Gateway's response body and status back to the
    // browser untouched. We don't try to parse/re-serialize it here --
    // that's the job of apiClient (client.ts) once it reaches the
    // browser side.
    const responsePayload = await beResponse.text();

    return new NextResponse(responsePayload, {
        status: beResponse.status,
        headers: {
            'content-type': beResponse.headers.get('content-type') ?? 'application/json',
        },
    });
}

// Next.js requires each HTTP method to be its own named export.
// All five just delegate to the same proxy() logic -- the only
// difference between them is req.method, which proxy() already reads
// off the request itself.
export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxy(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxy(req, (await params).path);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxy(req, (await params).path);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxy(req, (await params).path);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    return proxy(req, (await params).path);
}

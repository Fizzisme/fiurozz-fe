'use server';

import { cookies } from 'next/headers';

import { gatewayClient, ApiError } from '@/services/gateway-client';
import type {
    ICurrentUser,
    IFollowResult,
    IUpdateCurrentUserPayload,
    IUserSummary,
    IUsersCursorPage,
    IUsersQueries,
    UpdateCurrentUserResult,
} from '@/types/user';
import {
    fetchUsersCursorPage as fetchMockUsersCursorPage,
    getUserByDisplayName as getMockUserByDisplayName,
    setMockFollow,
} from '@/mock-data/users';

const EMPTY_PAGE: IUsersCursorPage = { items: [], nextCursor: null, hasMore: false, total: 0 };

// Reads the caller's identity via the httpOnly accessToken cookie and
// asks the Gateway for the full profile. The Gateway re-verifies the
// token and attaches X-User-Id when forwarding to User Service --
// this function never decodes/trusts the token itself, it just carries
// it along as a normal Authorization header.
export async function getCurrentUserAction(): Promise<ICurrentUser | null> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) return null;

    try {
        const envelope = await gatewayClient.get<ICurrentUser>('/api/users/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        return envelope.success ? envelope.data : null;
    } catch {
        return null;
    }
}


// Saves a partial profile update. Unlike the read above, a failure here must
// reach the user: the message carries BE validation text ("display name taken")
// that the edit form needs to show next to the offending field.
export async function updateCurrentUserAction(
    payload: IUpdateCurrentUserPayload,
): Promise<UpdateCurrentUserResult> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    if (!accessToken) return { ok: false, message: 'Sign in to edit your profile.' };

    try {
        const envelope = await gatewayClient.patch<ICurrentUser>('/api/users/me', payload, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (envelope.success && envelope.data) return { ok: true, user: envelope.data };
        return { ok: false, message: envelope.message || 'Could not save your profile.' };
    } catch (error) {
        // ApiError.message already holds the BE's own message when it sent one.
        if (error instanceof ApiError) return { ok: false, message: error.message };
        return { ok: false, message: 'Could not save your profile.' };
    }
}

// GET /api/users answers with IUsersCursorPage as-is: the User Service DTO
// matches IUser field for field, so there is nothing to map. stats/isFollowing
// simply stay undefined — the service has no follower/like counts yet.
export async function getUsersCursorPageAction(query: IUsersQueries = {}): Promise<IUsersCursorPage> {
    try {
        const envelope = await gatewayClient.get<IUsersCursorPage>('/api/users/', {
            query: {
                cursor: query.cursor ?? undefined,
                limit: query.limit,
                occupation: query.role ?? undefined,
                skills: query.skill ?? undefined,
                sort: query.sort ?? undefined,
            },
        });

        return envelope.data ?? EMPTY_PAGE;
    } catch (error) {
        if (error instanceof ApiError && error.payload) {
            const envelope = error.payload as { data?: IUsersCursorPage };
            if (envelope.data) return envelope.data;
        }

        // MockData
        return fetchMockUsersCursorPage(query);
    }
}

export async function getUserByDisplayNameAction(displayName: string): Promise<IUserSummary | null> {
    try {
        const envelope = await gatewayClient.get<IUserSummary>(`/api/users/${displayName}`);
        return envelope.data ?? null;
    } catch (error) {
        if (error instanceof ApiError && error.payload) {
            const envelope = error.payload as { data?: IUserSummary | null };
            return envelope.data ?? null;
        }

        return getMockUserByDisplayName(displayName) ?? null;
    }
}

export async function setUserFollowAction(displayName: string, follow: boolean): Promise<IFollowResult> {
    try {
        // TODO: real url
        const path = `/api/users/${displayName}/follow`;
        const envelope = follow
            ? await gatewayClient.post<IFollowResult>(path)
            : await gatewayClient.delete<IFollowResult>(path);

        if (envelope.data) return envelope.data;
    } catch (error) {
        if (error instanceof ApiError && error.payload) {
            const envelope = error.payload as { data?: IFollowResult };
            if (envelope.data) return envelope.data;
        }
    }

    // MockData
    const user = setMockFollow(displayName, follow);
    return {
        isFollowing: user?.isFollowing ?? follow,
        followers: user?.stats?.followers ?? 0,
    };
}

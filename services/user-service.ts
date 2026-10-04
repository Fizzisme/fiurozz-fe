import { apiClient, ApiError } from '@/services/client';
import type {
    IFollowResult,
    IUpdateCurrentUserPayload,
    IUserSummary,
    IUsersCursorPage,
    IUsersQueries,
    UpdateCurrentUserResult,
} from '@/types/user';
import {
    getCurrentUserAction,
    getUserByDisplayNameAction,
    getUsersCursorPageAction,
    setUserFollowAction,
    updateCurrentUserAction,
} from '@/actions/user-action';

export type ProfileImageResult = { ok: true } | { ok: false; message: string };

// Avatar/cover endpoints take multipart (one `file` part), so they go through the browser
// proxy like createProject instead of a server action (which caps request bodies at 1MB).
// POST = first upload, PUT = replace, DELETE = remove. The caller re-reads /me afterwards
// rather than relying on what the upload answers with.
async function sendProfileImage(
    kind: 'avatar' | 'cover',
    method: 'post' | 'put' | 'delete',
    file?: File,
): Promise<ProfileImageResult> {
    const fallback = `Could not update your ${kind}.`;

    try {
        const path = `/api/users/me/${kind}`;
        if (method === 'delete') {
            const envelope = await apiClient.delete<unknown>(path);
            return envelope.success ? { ok: true } : { ok: false, message: envelope.message || fallback };
        }

        const form = new FormData();
        form.append('file', file as File);
        const envelope = await apiClient[method]<unknown>(path, form);
        return envelope.success ? { ok: true } : { ok: false, message: envelope.message || fallback };
    } catch (error) {
        // ApiError.message already holds the BE's own message (413, 415, rate limit...).
        return { ok: false, message: error instanceof ApiError ? error.message : fallback };
    }
}

export const userService = {
    async getMe() {
        return getCurrentUserAction();
    },

    async updateMe(payload: IUpdateCurrentUserPayload): Promise<UpdateCurrentUserResult> {
        return updateCurrentUserAction(payload);
    },

    async uploadAvatar(file: File): Promise<ProfileImageResult> {
        return sendProfileImage('avatar', 'post', file);
    },

    async replaceAvatar(file: File): Promise<ProfileImageResult> {
        return sendProfileImage('avatar', 'put', file);
    },

    async deleteAvatar(): Promise<ProfileImageResult> {
        return sendProfileImage('avatar', 'delete');
    },

    async uploadCover(file: File): Promise<ProfileImageResult> {
        return sendProfileImage('cover', 'post', file);
    },

    async replaceCover(file: File): Promise<ProfileImageResult> {
        return sendProfileImage('cover', 'put', file);
    },

    async deleteCover(): Promise<ProfileImageResult> {
        return sendProfileImage('cover', 'delete');
    },

    async getUsers(queries: IUsersQueries = {}): Promise<IUsersCursorPage> {
        return getUsersCursorPageAction(queries);
    },

    async getUserByDisplayName(displayName: string): Promise<IUserSummary | null> {
        return getUserByDisplayNameAction(displayName);
    },

    async setFollow(targetUserId: string, displayName: string, follow: boolean): Promise<IFollowResult> {
        return setUserFollowAction(targetUserId, displayName, follow);
    },
};

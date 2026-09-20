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

export const userService = {
    async getMe() {
        return getCurrentUserAction();
    },

    async updateMe(payload: IUpdateCurrentUserPayload): Promise<UpdateCurrentUserResult> {
        return updateCurrentUserAction(payload);
    },

    async getUsers(queries: IUsersQueries = {}): Promise<IUsersCursorPage> {
        return getUsersCursorPageAction(queries);
    },

    async getUserByDisplayName(displayName: string): Promise<IUserSummary | null> {
        return getUserByDisplayNameAction(displayName);
    },

    async setFollow(displayName: string, follow: boolean): Promise<IFollowResult> {
        return setUserFollowAction(displayName, follow);
    },
};

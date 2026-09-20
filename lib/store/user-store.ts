import { create } from 'zustand';

import type { ICurrentUser } from '@/types/user';

interface IUserState {
    user: ICurrentUser | null;
    // Distinguishes "we haven't checked yet" from "checked, no user
    // logged in". Without this, the very first render (before
    // AuthProvider's effect runs) would look identical to a logged-out
    // state, which can cause a flash of the wrong UI (e.g. showing the
    // login icon for a split second even when the user IS logged in).
    isInitialized: boolean;
    setUser: (user: ICurrentUser | null) => void;
    updateUser: (patch: Partial<ICurrentUser>) => void;
    clearUser: () => void;
}

export const useUserStore = create<IUserState>((set) => ({
    user: null,
    isInitialized: false,

    setUser: (user) => set({ user, isInitialized: true }),

    // For partial updates after a PATCH (e.g. user changes just their
    // avatar in Settings) -- merges into the existing user instead of
    // requiring the caller to pass the whole object back.
    updateUser: (patch) =>
        set((state) => ({
            user: state.user ? { ...state.user, ...patch } : state.user,
        })),

    clearUser: () => set({ user: null, isInitialized: true }),
}));

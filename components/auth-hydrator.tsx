// components/auth-hydrator.tsx
'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/store/user-store';
import type { ICurrentUser } from '@/types/user';

// Bridges server-fetched user data into the client-side Zustand store.
// This has nothing to do with React Context/Provider pattern -- Zustand
// doesn't need one. It exists purely because Server Components can't
// call client hooks (like useUserStore) directly; this is the one
// client component whose only job is to receive the server-fetched
// data as a prop and hand it off to the store.
export function AuthHydrator({ initialUser }: { initialUser: ICurrentUser | null }) {
    const setUser = useUserStore((state) => state.setUser);

    useEffect(() => {
        setUser(initialUser);
    }, [initialUser, setUser]);

    return null; // no render
}
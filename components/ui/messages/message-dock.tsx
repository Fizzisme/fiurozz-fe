'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import ChatWindow from '@/components/ui/messages/chat-window';
import ConversationList from '@/components/ui/messages/conversation-list';
import { useMessageDockStore } from '@/lib/store/message-dock-store';
import { useUserStore } from '@/lib/store/user-store';
import { messageService } from '@/services/message-service';
import type { Conversation } from '@/mock-data/messages';

/**
 * The site-wide messaging dock: a collapsed Messaging bar pinned bottom-right
 * with chat windows opening to its left.
 *
 * It is deliberately absent from `/design`. That route is a sealed second
 * visual world — ivory paper, EB Garamond, `ctr-*` tokens — and an application
 * panel parked in its corner would be exactly the bleed DESIGN.md forbids.
 */
export default function MessageDock() {
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();

    const user = useUserStore((state) => state.user);
    const isInitialized = useUserStore((state) => state.isInitialized);

    const openWindows = useMessageDockStore((state) => state.openWindows);
    /**
     * How many windows fit, and whether the dock exists at all. A 320px window
     * beside a 296px bar needs room a phone or tablet does not have, so below
     * `lg` the answer is none — and because this is a count rather than a CSS
     * `hidden`, nothing mounts and no conversation request is made there.
     */
    const [maxVisible, setMaxVisible] = useState(0);

    useEffect(() => {
        const wide = window.matchMedia('(min-width: 1024px)');
        const wider = window.matchMedia('(min-width: 1536px)');
        const update = () => setMaxVisible(!wide.matches ? 0 : wider.matches ? 3 : 2);

        update();
        wide.addEventListener('change', update);
        wider.addEventListener('change', update);
        return () => {
            wide.removeEventListener('change', update);
            wider.removeEventListener('change', update);
        };
    }, []);
    const [conversations, setConversations] = useState<Conversation[] | null>(null);

    useEffect(() => {
        if (!user || maxVisible === 0) return;

        let alive = true;
        messageService.getConversations().then((items) => {
            if (alive) setConversations(items);
        });
        return () => {
            alive = false;
        };
    }, [user, maxVisible]);

    // A window may name someone the list has never held — press Message on a
    // builder you have not written to and the conversation is created here.
    const ensure = useCallback(async (displayName: string) => {
        const created = await messageService.openConversation(displayName);
        if (!created) return;
        setConversations((prev) =>
            prev && prev.some((c) => c.id === created.id) ? prev : [created, ...(prev ?? [])],
        );
    }, []);

    const markRead = useCallback((conversationId: string) => {
        setConversations((prev) =>
            prev?.map((c) => (c.id === conversationId && c.unread > 0 ? { ...c, unread: 0 } : c)) ?? prev,
        );
    }, []);

    useEffect(() => {
        if (conversations === null) return;
        openWindows
            .filter((displayName) => !conversations.some((c) => c.id === displayName))
            .forEach((displayName) => void ensure(displayName));
    }, [openWindows, conversations, ensure]);

    // Messaging belongs to a signed-in account, so the dock does not exist for a
    // guest at all — no bar, no windows. `isInitialized` gates the first frame so
    // a signed-in visitor never sees it flash away.
    if (!isInitialized || !user) return null;

    if (pathname.startsWith('/design')) return null;

    // Desktop only — a phone or tablet is too narrow to carry the dock.
    if (maxVisible === 0) return null;

    const unreadTotal = (conversations ?? []).reduce((sum, c) => sum + c.unread, 0);

    // Newest window sits nearest the bar, so the row is built right to left.
    const windows = openWindows
        .map((displayName) => conversations?.find((c) => c.id === displayName))
        .filter((c): c is Conversation => Boolean(c))
        .reverse()
        // Only what fits is rendered — an off-screen window must not mount and
        // quietly mark its conversation read.
        .slice(-maxVisible);

    return (
        <div
            className="pointer-events-none fixed bottom-0 right-0 z-40 flex max-h-dvh items-end gap-2 overflow-hidden px-4 pt-4"
        >
            <AnimatePresence initial={false}>
                {windows.map((conversation) => {
                    return (
                        <motion.div
                            key={conversation.id}
                            className="min-h-0"
                            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <ChatWindow conversation={conversation} onRead={markRead} />
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            <ConversationList conversations={conversations} unreadTotal={unreadTotal} />
        </div>
    );
}

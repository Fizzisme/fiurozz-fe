'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/global/avatar';
import { Skeleton } from '@/components/ui/global/skeleton';
import { useMessageDockStore } from '@/lib/store/message-dock-store';
import type { Conversation } from '@/mock-data/messages';

interface ConversationListProps {
    conversations: Conversation[] | null;
    unreadTotal: number;
}

function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase();
}

/** "4m", "3h", "2d" — a relative stamp, compact enough for a list row. */
function ago(iso: string): string {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
}

export default function ConversationList({ conversations, unreadTotal }: ConversationListProps) {
    const isListOpen = useMessageDockStore((state) => state.isListOpen);
    const toggleList = useMessageDockStore((state) => state.toggleList);
    const openConversation = useMessageDockStore((state) => state.openConversation);

    return (
        <section
            aria-label="Messaging"
            className="pointer-events-auto flex w-[18.5rem] flex-col overflow-hidden rounded-t bg-card ring-1 ring-foreground/10 shadow-[0_20px_60px_rgba(30,25,20,0.14)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
            <button
                type="button"
                onClick={toggleList}
                aria-expanded={isListOpen}
                className="flex shrink-0 cursor-pointer items-center gap-2 px-3 py-2.5 outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
                <span className="flex-1 text-left text-sm font-semibold tracking-[-0.01em]">Messaging</span>

                {unreadTotal > 0 && (
                    <span className="flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 font-mono text-[11px] tabular-nums leading-none text-primary-foreground">
                        {unreadTotal}
                    </span>
                )}

                {isListOpen ? (
                    <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                    <ChevronUp className="size-4 text-muted-foreground" />
                )}
            </button>

            {isListOpen && (
                <div className="thin-scrollbar max-h-[min(21rem,50dvh)] overflow-y-auto border-t border-foreground/10">
                    {conversations === null ? (
                        <div className="space-y-3 p-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <Skeleton className="size-9 shrink-0 rounded-full" />
                                    <div className="min-w-0 flex-1">
                                        <Skeleton className="h-3.5 w-2/5" />
                                        <Skeleton className="mt-1.5 h-3 w-4/5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="px-4 py-10 text-center">
                            <p className="text-sm font-medium">No conversations yet.</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Open a builder&apos;s card and press Message to start one.
                            </p>
                        </div>
                    ) : (
                        <ul>
                            {conversations.map((conversation) => (
                                <li key={conversation.id}>
                                    <button
                                        type="button"
                                        onClick={() => openConversation(conversation.displayName)}
                                        className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50"
                                    >
                                        <Avatar className="size-9 shrink-0 rounded-full after:rounded-full">
                                            <AvatarImage src={conversation.avatar} alt="" className="rounded-full" />
                                            <AvatarFallback className="rounded-full bg-muted font-mono text-[11px] text-foreground/60">
                                                {initials(conversation.fullName)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-baseline gap-2">
                                                <span
                                                    className={`truncate text-sm ${
                                                        conversation.unread > 0 ? 'font-semibold' : 'font-medium'
                                                    }`}
                                                >
                                                    {conversation.fullName}
                                                </span>
                                                <time
                                                    dateTime={conversation.lastAt}
                                                    className="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground"
                                                >
                                                    {ago(conversation.lastAt)}
                                                </time>
                                            </span>

                                            <span className="mt-0.5 flex items-center gap-2">
                                                <span
                                                    className={`truncate text-xs ${
                                                        conversation.unread > 0
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {conversation.lastMessage || 'No messages yet'}
                                                </span>
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </section>
    );
}

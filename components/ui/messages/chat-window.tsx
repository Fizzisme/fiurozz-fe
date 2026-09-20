'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Minus, Send, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/global/avatar';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Skeleton } from '@/components/ui/global/skeleton';
import { useMessageDockStore } from '@/lib/store/message-dock-store';
import { messageService } from '@/services/message-service';
import type { Conversation, DirectMessage } from '@/mock-data/messages';

interface ChatWindowProps {
    conversation: Conversation;
    /** Lifts the read receipt back to the dock, which owns the unread counts. */
    onRead: (conversationId: string) => void;
}

function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase();
}

/** 09:24 — a clock reading is a fact, so it is set in mono wherever it appears. */
function clock(iso: string): string {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({ conversation, onRead }: ChatWindowProps) {
    const closeConversation = useMessageDockStore((state) => state.closeConversation);
    const toggleMinimize = useMessageDockStore((state) => state.toggleMinimize);
    const isMinimized = useMessageDockStore((state) => Boolean(state.minimized[conversation.displayName]));

    const [messages, setMessages] = useState<DirectMessage[] | null>(null);
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let alive = true;
        messageService.getMessages(conversation.id).then((items) => {
            if (alive) setMessages(items);
        });
        // The server clears its own copy; the dock holds the count the bar renders,
        // so it has to be told too or the badge never moves.
        messageService.markRead(conversation.id);
        onRead(conversation.id);

        return () => {
            alive = false;
        };
    }, [conversation.id, onRead]);

    // Stick to the newest message without the list visibly jumping first.
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages, isMinimized]);

    const send = async (event: React.FormEvent) => {
        event.preventDefault();
        const text = draft.trim();
        if (!text || isSending) return;

        setDraft('');
        setIsSending(true);

        try {
            const sent = await messageService.send(conversation.id, text);
            if (sent) setMessages((prev) => [...(prev ?? []), sent]);
        } finally {
            setIsSending(false);
        }
    };

    const headerId = `chat-${conversation.displayName}-title`;

    return (
        <section
            aria-labelledby={headerId}
            className="pointer-events-auto flex h-[25rem] max-h-full w-80 flex-col overflow-hidden rounded-t bg-card ring-1 ring-foreground/10 shadow-[0_20px_60px_rgba(30,25,20,0.14)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
            {/* HEADER — doubles as the collapse control */}
            <div className="flex shrink-0 items-center gap-2 border-b border-foreground/10 px-3 py-2">
                <button
                    type="button"
                    onClick={() => toggleMinimize(conversation.displayName)}
                    aria-expanded={!isMinimized}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-sm text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <Avatar className="size-7 rounded-full after:rounded-full">
                        <AvatarImage src={conversation.avatar} alt="" className="rounded-full" />
                        <AvatarFallback className="rounded-full bg-muted font-mono text-[11px] text-foreground/60">
                            {initials(conversation.fullName)}
                        </AvatarFallback>
                    </Avatar>

                    <span id={headerId} className="truncate text-sm font-semibold tracking-[-0.01em]">
                        {conversation.fullName}
                    </span>
                </button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => toggleMinimize(conversation.displayName)}
                    aria-label={isMinimized ? `Expand chat with ${conversation.fullName}` : `Collapse chat with ${conversation.fullName}`}
                >
                    <Minus />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => closeConversation(conversation.displayName)}
                    aria-label={`Close chat with ${conversation.fullName}`}
                >
                    <X />
                </Button>
            </div>

            {!isMinimized && (
                <div className="flex min-h-0 flex-1 flex-col">
                    {/* TRANSCRIPT */}
                    <div ref={scrollRef} className="thin-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-3">
                        {messages === null ? (
                            <div className="space-y-3">
                                <Skeleton className="h-9 w-4/5 rounded" />
                                <Skeleton className="ml-auto h-9 w-3/5 rounded" />
                                <Skeleton className="h-9 w-2/3 rounded" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                                <p className="text-sm font-medium">No messages yet.</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Say hello to {conversation.fullName.split(' ')[0]} — a {conversation.role} on Fiurozz.
                                </p>
                            </div>
                        ) : (
                            <ul className="space-y-2.5">
                                {messages.map((message) => {
                                    const mine = message.from === 'me';
                                    return (
                                        <li
                                            key={message.id}
                                            className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
                                        >
                                            <span
                                                className={`max-w-[85%] rounded px-2.5 py-1.5 text-sm leading-relaxed ${
                                                    mine
                                                        ? 'bg-foreground text-background'
                                                        : 'bg-muted text-foreground'
                                                }`}
                                            >
                                                {message.text}
                                            </span>
                                            <time
                                                dateTime={message.sentAt}
                                                className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground"
                                            >
                                                {clock(message.sentAt)}
                                            </time>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* COMPOSER — the dock only exists for a signed-in account, so
                        there is no guest branch to render here. */}
                    <form onSubmit={send} className="flex items-center gap-2 border-t border-foreground/10 p-2">
                            <label htmlFor={`composer-${conversation.displayName}`} className="sr-only">
                                Message {conversation.fullName}
                            </label>
                            <input
                                id={`composer-${conversation.displayName}`}
                                value={draft}
                                onChange={(event) => setDraft(event.target.value)}
                                placeholder="Write a message"
                                autoComplete="off"
                                className="h-9 min-w-0 flex-1 rounded border border-input bg-input-background px-3 text-sm outline-none transition-[color,box-shadow] selection:bg-[#29588f] selection:text-white placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
                            />
                            <Button
                                type="submit"
                                size="icon-sm"
                                disabled={!draft.trim() || isSending}
                                aria-label="Send message"
                            >
                                <Send />
                            </Button>
                    </form>
                </div>
            )}
        </section>
    );
}

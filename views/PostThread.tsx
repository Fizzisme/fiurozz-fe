'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import { PostComposer } from '@/components/ui/post/post-composer';
import { PostItem } from '@/components/ui/post/post-item';
import type { Post, PostThread as PostThreadData } from '@/mock-data/posts';

interface PostThreadProps {
    thread: PostThreadData;
    /** Opened from a Reply button (?reply=1): put the caret in the reply field */
    autoFocusReply: boolean;
}

export default function PostThread({ thread, autoFocusReply }: PostThreadProps) {
    const reduceMotion = useReducedMotion();
    const { post, parent } = thread;
    const [replies, setReplies] = useState<Post[]>(thread.replies);

    const handlePosted = (reply: Post) => {
        setReplies((current) => [...current, reply]);
    };

    return (
        <div className="w-full px-4 pb-10 sm:px-8">
            <div className="mx-auto w-full max-w-[640px]">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <Link
                        href="/posts"
                        aria-label="Back to posts"
                        className="-ml-2 inline-flex size-9 items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                    <h1 className="text-lg font-semibold tracking-[-0.01em]">Thread</h1>
                </header>

                <div className="border-t border-border">
                    {parent && <PostItem post={parent} variant="parent" className="pb-0" />}
                    <PostItem post={post} variant="focus" replyCount={post.stats.replies - thread.replies.length + replies.length} />
                </div>

                <PostComposer
                    parent={{ id: post.id, authorName: post.author.fullName }}
                    onPosted={handlePosted}
                    autoFocus={autoFocusReply}
                    className="border-y border-border"
                />

                {replies.length === 0 ? (
                    <p className="py-12 text-center text-sm text-muted-foreground">No replies yet. Start the conversation.</p>
                ) : (
                    <>
                        <h2 className="sr-only">Replies</h2>
                        <ul className="divide-y divide-border">
                            <AnimatePresence initial={false}>
                                {replies.map((reply) => (
                                    <motion.li
                                        key={reply.id}
                                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    >
                                        <PostItem post={reply} />
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Bookmark, Check, Heart, Link2, MessageCircle, Quote, Repeat2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/global/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import { PostCodeBlock } from '@/components/ui/post/post-code';
import { Skeleton } from '@/components/ui/global/skeleton';
import { useUserStore } from '@/lib/store/user-store';
import { postService } from '@/services/post-service';
import type { Post, PostAuthor, PostProject, PostQuote, PostStats, PostViewerState } from '@/mock-data/posts';
import { cn } from '@/lib/utils';

// ============================================================
// SMALL PIECES
// ============================================================

export function initials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase();
}

export function PostAvatar({ author, className }: { author: Pick<PostAuthor, 'fullName' | 'avatar'>; className?: string }) {
    return (
        <Avatar className={cn('size-9 rounded-full ring-1 ring-foreground/10', className)}>
            {author.avatar && <AvatarImage src={author.avatar} alt="" className="rounded-full" />}
            <AvatarFallback className="rounded-full text-[11px] font-medium">{initials(author.fullName)}</AvatarFallback>
        </Avatar>
    );
}

/** "now", "5m", "3h", "2d", then a date — the Threads cadence. */
function compactTime(iso: string): string {
    const date = new Date(iso);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return format(date, 'MMM d');
}

function PostTime({ iso, href, full = false }: { iso: string; href?: string; full?: boolean }) {
    const date = new Date(iso);
    const label = full ? format(date, 'h:mm a · MMM d, yyyy') : compactTime(iso);
    const time = (
        <time dateTime={iso} title={format(date, 'PPpp')} suppressHydrationWarning>
            {label}
        </time>
    );

    if (!href) return <span className="text-[13px] text-muted-foreground">{time}</span>;

    return (
        <Link
            href={href}
            className="rounded text-[13px] text-muted-foreground outline-none hover:underline hover:underline-offset-4 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
            {time}
        </Link>
    );
}

const TOKEN = /(`[^`\n]+`|https?:\/\/[^\s]+)/g;

/** Plain text with `inline code` and bare links recognised — nothing else is parsed. */
export function PostText({ text, className }: { text: string; className?: string }) {
    if (!text) return null;

    return (
        <p className={cn('text-[15px] leading-relaxed break-words whitespace-pre-wrap', className)}>
            {text.split(TOKEN).map((part, index) => {
                if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
                    return (
                        <code key={index} className="rounded-[4px] bg-muted px-1 py-0.5 font-mono text-[0.84em]">
                            {part.slice(1, -1)}
                        </code>
                    );
                }
                if (/^https?:\/\//.test(part)) {
                    return (
                        <a
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noreferrer nofollow"
                            className="break-all underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
                        >
                            {part.replace(/^https?:\/\//, '')}
                        </a>
                    );
                }
                return part;
            })}
        </p>
    );
}

function PostImages({ images, authorName }: { images: string[]; authorName: string }) {
    if (images.length === 0) return null;

    const alt = (index: number) => `Image ${index + 1} of ${images.length} from ${authorName}`;

    if (images.length === 1) {
        return (
            <div className="relative aspect-[4/3] w-full max-w-[520px] overflow-hidden rounded bg-muted ring-1 ring-foreground/10">
                <Image
                    src={images[0]}
                    alt={alt(0)}
                    fill
                    sizes="(min-width: 768px) 520px, 90vw"
                    className="object-cover"
                    unoptimized={images[0].startsWith('blob:')}
                />
            </div>
        );
    }

    return (
        <div className="no-scrollbar -mr-4 flex snap-x gap-2 overflow-x-auto pr-4">
            {images.map((src, index) => (
                <div
                    key={src}
                    className="relative aspect-[4/5] h-60 shrink-0 snap-start overflow-hidden rounded bg-muted ring-1 ring-foreground/10"
                >
                    <Image
                        src={src}
                        alt={alt(index)}
                        fill
                        sizes="200px"
                        className="object-cover"
                        unoptimized={src.startsWith('blob:')}
                    />
                </div>
            ))}
        </div>
    );
}

export function PostProjectCard({ project, className }: { project: PostProject; className?: string }) {
    return (
        <Link
            href={project.href}
            className={cn(
                'group flex items-center gap-3 rounded p-2 pr-3 ring-1 ring-foreground/10 outline-none transition-colors hover:bg-[#f5f2ed] focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:hover:bg-white/5',
                className,
            )}
        >
            <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-[6px] bg-primary/10">
                <Image src={project.thumbnail} alt="" fill sizes="64px" className="object-cover" />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{project.title}</span>
                <span className="block truncate font-mono text-[11px] text-muted-foreground">
                    {project.categoryTitle.toLowerCase()} · {project.techStack.slice(0, 3).join(', ')}
                </span>
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
    );
}

export function PostQuoteCard({ quote, linked = true, className }: { quote: PostQuote; linked?: boolean; className?: string }) {
    const body = (
        <>
            <span className="flex items-center gap-2">
                <PostAvatar author={quote.author} className="size-5" />
                <span className="truncate text-[13px] font-semibold">{quote.author.fullName}</span>
                <span className="text-[13px] text-muted-foreground" suppressHydrationWarning>
                    {compactTime(quote.createdAt)}
                </span>
            </span>
            <PostText text={quote.text} className="mt-1.5 line-clamp-3 text-sm" />
        </>
    );

    const base = 'block rounded p-3 ring-1 ring-foreground/10';

    if (!linked) return <div className={cn(base, className)}>{body}</div>;

    return (
        <Link
            href={`/posts/${quote.id}`}
            className={cn(
                base,
                'outline-none transition-colors hover:bg-[#f5f2ed] focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:hover:bg-white/5',
                className,
            )}
        >
            {body}
        </Link>
    );
}

// ============================================================
// ACTIONS
// ============================================================

function formatCount(value: number): string {
    if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    return `${value}`;
}

const ACTION =
    'inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded px-2 text-muted-foreground outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50';

const STAT_FOR: Partial<Record<keyof PostViewerState, keyof PostStats>> = { liked: 'likes', reposted: 'reposts' };

const GUEST_VIEWER: PostViewerState = { liked: false, reposted: false, bookmarked: false };

interface PostActionsProps {
    post: Post;
    /** Reply count maintained by the thread page as replies arrive */
    replyCount?: number;
    onQuote?: (post: Post) => void;
}

function PostActions({ post, replyCount, onQuote }: PostActionsProps) {
    const router = useRouter();
    const reduceMotion = useReducedMotion();
    const user = useUserStore((state) => state.user);

    const [ownViewer, setViewer] = useState<PostViewerState>(post.viewer);
    // A guest has no likes or bookmarks of their own, whatever the payload says.
    const viewer = user ? ownViewer : GUEST_VIEWER;
    const [stats, setStats] = useState<PostStats>(post.stats);
    const [copied, setCopied] = useState(false);

    const toggle = async (key: keyof PostViewerState) => {
        if (!user) {
            router.push('/login');
            return;
        }

        const next = !viewer[key];
        const previous = { viewer, stats };
        const stat = STAT_FOR[key];

        setViewer((current) => ({ ...current, [key]: next }));
        if (stat) setStats((current) => ({ ...current, [stat]: Math.max(0, current[stat] + (next ? 1 : -1)) }));

        const result = await postService.setViewerState(post.id, key, next);
        if (result) {
            setViewer(result.viewer);
            setStats(result.stats);
        } else {
            setViewer(previous.viewer);
            setStats(previous.stats);
        }
    };

    const share = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard blocked: nothing to recover, the link is still in the address bar of the thread.
        }
    };

    const replies = replyCount ?? stats.replies;

    return (
        <div className="-ml-2 mt-2 flex items-center gap-0.5">
            <button
                type="button"
                onClick={() => toggle('liked')}
                aria-pressed={viewer.liked}
                aria-label={viewer.liked ? 'Unlike' : 'Like'}
                className={cn(ACTION, viewer.liked && 'text-primary hover:text-primary')}
            >
                <motion.span
                    key={viewer.liked ? 'liked' : 'idle'}
                    initial={reduceMotion || !viewer.liked ? false : { scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 14 }}
                    className="flex"
                >
                    <Heart className={cn('size-[18px]', viewer.liked && 'fill-current')} />
                </motion.span>
                {stats.likes > 0 && <span className="text-[13px] tabular-nums">{formatCount(stats.likes)}</span>}
            </button>

            <Link href={`/posts/${post.id}?reply=1`} aria-label="Reply" className={ACTION}>
                <MessageCircle className="size-[18px]" />
                {replies > 0 && <span className="text-[13px] tabular-nums">{formatCount(replies)}</span>}
            </Link>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label="Repost or quote"
                        className={cn(ACTION, viewer.reposted && 'text-foreground')}
                    >
                        <Repeat2 className={cn('size-[18px]', viewer.reposted && 'stroke-[2.5]')} />
                        {stats.reposts > 0 && <span className="text-[13px] tabular-nums">{formatCount(stats.reposts)}</span>}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-40">
                    <DropdownMenuItem onSelect={() => toggle('reposted')}>
                        <Repeat2 />
                        {viewer.reposted ? 'Undo repost' : 'Repost'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onSelect={() => (onQuote ? onQuote(post) : router.push(`/posts?quote=${post.id}`))}
                    >
                        <Quote />
                        Quote
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <button type="button" onClick={share} aria-label="Copy link to post" className={ACTION}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={copied ? 'copied' : 'link'}
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="flex"
                    >
                        {copied ? <Check className="size-[18px]" /> : <Link2 className="size-[18px]" />}
                    </motion.span>
                </AnimatePresence>
                <span className="sr-only" role="status">
                    {copied ? 'Link copied' : ''}
                </span>
            </button>

            <button
                type="button"
                onClick={() => toggle('bookmarked')}
                aria-pressed={viewer.bookmarked}
                aria-label={viewer.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                className={cn(ACTION, 'ml-auto', viewer.bookmarked && 'text-foreground')}
            >
                <Bookmark className={cn('size-[18px]', viewer.bookmarked && 'fill-current')} />
            </button>
        </div>
    );
}

// ============================================================
// POST
// ============================================================

interface PostItemProps {
    post: Post;
    /**
     * feed — a row in a list, the body opens the thread.
     * focus — the post a thread page is about.
     * parent — the post being replied to, drawn above the focus with a rail.
     */
    variant?: 'feed' | 'focus' | 'parent';
    replyCount?: number;
    onQuote?: (post: Post) => void;
    className?: string;
}

export function PostItem({ post, variant = 'feed', replyCount, onQuote, className }: PostItemProps) {
    const router = useRouter();
    const threadHref = `/posts/${post.id}`;
    const isFocus = variant === 'focus';

    // The body is a click target for the thread, but only when the click
    // wasn't on a control and the reader wasn't selecting text.
    const openThread = (event: React.MouseEvent<HTMLDivElement>) => {
        if (isFocus) return;
        if ((event.target as HTMLElement).closest('a, button, [role="menuitem"], pre, code')) return;
        if (window.getSelection()?.toString()) return;
        router.push(threadHref);
    };

    return (
        <article className={cn('flex gap-3 py-4', className)}>
            <div className="flex shrink-0 flex-col items-center">
                <PostAvatar author={post.author} className={isFocus ? 'size-11' : undefined} />
                {variant === 'parent' && <span aria-hidden className="mt-2 w-px flex-1 bg-border" />}
            </div>

            <div className="min-w-0 flex-1">
                <header className="flex items-baseline gap-1.5">
                    <span className="truncate text-[15px] font-semibold">{post.author.fullName}</span>
                    <span className="truncate font-mono text-[12px] text-muted-foreground">@{post.author.displayName}</span>
                    {!isFocus && (
                        <>
                            <span aria-hidden className="text-muted-foreground">
                                ·
                            </span>
                            <PostTime iso={post.createdAt} href={threadHref} />
                        </>
                    )}
                </header>
                {isFocus && post.author.role && <p className="text-[13px] text-muted-foreground">{post.author.role}</p>}

                <div onClick={openThread} className={cn('space-y-3', !isFocus && 'cursor-pointer', isFocus ? 'mt-3' : 'mt-0.5')}>
                    <PostText text={post.text} className={isFocus ? 'text-[17px]' : undefined} />
                    {post.code && <PostCodeBlock code={post.code} />}
                    <PostImages images={post.images} authorName={post.author.fullName} />
                    {post.project && <PostProjectCard project={post.project} />}
                    {post.quote && <PostQuoteCard quote={post.quote} />}
                </div>

                {isFocus && (
                    <p className="mt-4">
                        <PostTime iso={post.createdAt} full />
                    </p>
                )}

                <PostActions post={post} replyCount={replyCount} onQuote={onQuote} />
            </div>
        </article>
    );
}

/** Mirrors PostItem's own bands — header line, text, action row — rather than one flat rectangle. */
export function PostItemSkeleton() {
    return (
        <div aria-hidden="true" className="flex gap-3 py-4">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className="mt-2.5 h-3.5 w-full" />
                <Skeleton className="mt-1.5 h-3.5 w-2/3" />
                <div className="-ml-2 mt-3 flex items-center gap-3">
                    <Skeleton className="h-6 w-10 rounded" />
                    <Skeleton className="h-6 w-10 rounded" />
                    <Skeleton className="h-6 w-10 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                </div>
            </div>
        </div>
    );
}

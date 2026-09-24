'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Code2, FolderGit2, ImagePlus, Search, X } from 'lucide-react';

import { Button } from '@/components/animate-ui/components/buttons/button';
import { PostAvatar, PostProjectCard, PostQuoteCard } from '@/components/ui/post/post-item';
import { useUserStore } from '@/lib/store/user-store';
import { postService } from '@/services/post-service';
import {
    POST_CODE_LANGUAGES,
    POST_CODE_MAX_LENGTH,
    POST_MAX_IMAGES,
    POST_MAX_LENGTH,
    type Post,
    type PostCode,
    type PostProject,
} from '@/mock-data/posts';
import { cn } from '@/lib/utils';

const TOOL =
    'inline-flex size-8 items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 aria-pressed:bg-foreground/5 aria-pressed:text-foreground';

const REMOVE =
    'inline-flex size-6 items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50';

interface PostComposerProps {
    /** Replying: the post id and the name shown in the placeholder */
    parent?: { id: string; authorName: string } | null;
    quote?: Post | null;
    onClearQuote?: () => void;
    onPosted: (post: Post) => void;
    autoFocus?: boolean;
    /** id put on the text field, so a page can focus it */
    textareaId?: string;
    className?: string;
}

export function PostComposer({
    parent = null,
    quote = null,
    onClearQuote,
    onPosted,
    autoFocus = false,
    textareaId,
    className,
}: PostComposerProps) {
    const { user, isInitialized } = useUserStore();
    const generatedId = useId();
    const fieldId = textareaId ?? `composer-${generatedId}`;
    const errorId = `${fieldId}-error`;

    const [text, setText] = useState('');
    const [code, setCode] = useState<PostCode | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [project, setProject] = useState<PostProject | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PostProject[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);

    // Project search, debounced so typing doesn't fire a request per key.
    useEffect(() => {
        if (!pickerOpen) return;
        let cancelled = false;
        const timer = window.setTimeout(() => {
            postService.searchProjects(query).then((found) => {
                if (!cancelled) setResults(found);
            });
        }, 200);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [pickerOpen, query]);

    if (!isInitialized) {
        return (
            <div aria-hidden className={cn('flex items-center gap-3 py-4', className)}>
                <div className="size-9 animate-pulse rounded-full bg-muted" />
                <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className={cn('flex items-center justify-between gap-4 py-4', className)}>
                <p className="text-sm text-muted-foreground">
                    {parent ? 'Sign in to reply to this thread.' : 'Sign in to share what you’re building.'}
                </p>
                <Button asChild variant="outline" size="sm">
                    <Link href="/login">Log in</Link>
                </Button>
            </div>
        );
    }

    const remaining = POST_MAX_LENGTH - text.length;
    const hasContent = Boolean(text.trim() || code?.code.trim() || images.length || project || quote);
    const canSubmit = hasContent && remaining >= 0 && !isSubmitting;

    const addImages = (files: FileList | null) => {
        if (!files) return;
        const room = POST_MAX_IMAGES - images.length;
        const picked = Array.from(files).filter((file) => file.type.startsWith('image/'));
        if (picked.length > room) setError(`You can attach up to ${POST_MAX_IMAGES} images.`);
        else setError(null);
        // Local previews only — the mock keeps these URLs for this browser session.
        setImages((current) => [...current, ...picked.slice(0, room).map((file) => URL.createObjectURL(file))]);
    };

    const removeImage = (src: string) => {
        URL.revokeObjectURL(src);
        setImages((current) => current.filter((item) => item !== src));
    };

    const reset = () => {
        setText('');
        setCode(null);
        setImages([]);
        setProject(null);
        setPickerOpen(false);
        setQuery('');
        setError(null);
    };

    const submit = async (event?: React.FormEvent) => {
        event?.preventDefault();
        if (!hasContent) {
            setError('Write something first.');
            return;
        }
        if (remaining < 0) {
            setError(`Keep it under ${POST_MAX_LENGTH} characters.`);
            return;
        }
        if (code && !code.code.trim()) {
            setError('Add some code, or remove the empty code block.');
            return;
        }
        if (code && code.code.length > POST_CODE_MAX_LENGTH) {
            setError('That code block is too long.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        const result = await postService.create({
            text,
            code,
            images,
            projectId: project?.id ?? null,
            quoteId: quote?.id ?? null,
            parentId: parent?.id ?? null,
        });
        setIsSubmitting(false);

        if (!result.ok) {
            setError(result.message);
            return;
        }

        reset();
        onClearQuote?.();
        onPosted(result.post);
    };

    const idleLabel = parent ? 'Reply' : 'Post';

    return (
        <form onSubmit={submit} noValidate className={cn('flex gap-3 py-4', className)}>
            <PostAvatar author={{ fullName: user.fullName ?? user.displayName, avatar: user.avatarUrl }} />

            <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{user.fullName ?? user.displayName}</p>

                <label htmlFor={fieldId} className="sr-only">
                    {parent ? `Reply to ${parent.authorName}` : 'Write a post'}
                </label>
                <textarea
                    id={fieldId}
                    name="text"
                    rows={1}
                    value={text}
                    autoFocus={autoFocus}
                    onChange={(event) => {
                        setText(event.target.value);
                        if (error) setError(null);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                            event.preventDefault();
                            void submit();
                        }
                    }}
                    placeholder={parent ? `Reply to ${parent.authorName}…` : 'What are you building?'}
                    aria-invalid={remaining < 0 || !!error}
                    aria-describedby={error ? errorId : undefined}
                    className="field-sizing-content block max-h-[40vh] min-h-6 w-full resize-none bg-transparent text-[15px] leading-relaxed caret-primary outline-none placeholder:text-muted-foreground"
                />

                <div className="space-y-3 empty:hidden [&:has(>*)]:mt-3">
                    {code && (
                        <div className="overflow-hidden rounded ring-1 ring-foreground/10">
                            <div className="flex h-9 items-center justify-between gap-2 border-b border-border pr-1.5 pl-1">
                                <label htmlFor={`${fieldId}-lang`} className="sr-only">
                                    Language
                                </label>
                                <select
                                    id={`${fieldId}-lang`}
                                    value={code.lang}
                                    onChange={(event) => setCode({ ...code, lang: event.target.value })}
                                    className="h-7 rounded bg-transparent px-2 font-mono text-[11px] text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                >
                                    {POST_CODE_LANGUAGES.map((language) => (
                                        <option key={language.value} value={language.value}>
                                            {language.label}
                                        </option>
                                    ))}
                                </select>
                                <button type="button" onClick={() => setCode(null)} aria-label="Remove code block" className={REMOVE}>
                                    <X className="size-3.5" />
                                </button>
                            </div>
                            <label htmlFor={`${fieldId}-code`} className="sr-only">
                                Code
                            </label>
                            <textarea
                                id={`${fieldId}-code`}
                                value={code.code}
                                onChange={(event) => setCode({ ...code, code: event.target.value })}
                                spellCheck={false}
                                placeholder="Paste your snippet"
                                onKeyDown={(event) => {
                                    // Tab indents inside the snippet instead of leaving the field.
                                    if (event.key !== 'Tab' || event.shiftKey) return;
                                    event.preventDefault();
                                    const el = event.currentTarget;
                                    const { selectionStart, selectionEnd } = el;
                                    const next = `${code.code.slice(0, selectionStart)}  ${code.code.slice(selectionEnd)}`;
                                    setCode({ ...code, code: next });
                                    requestAnimationFrame(() => el.setSelectionRange(selectionStart + 2, selectionStart + 2));
                                }}
                                className="field-sizing-content block max-h-80 min-h-24 w-full resize-none bg-[#fafaf8] px-3 py-3 font-mono text-[12.5px] leading-[1.65] outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-inset dark:bg-white/[0.03]"
                            />
                        </div>
                    )}

                    {images.length > 0 && (
                        <ul className="no-scrollbar flex gap-2 overflow-x-auto">
                            {images.map((src, index) => (
                                <li key={src} className="relative aspect-[4/5] h-40 shrink-0 overflow-hidden rounded bg-muted ring-1 ring-foreground/10">
                                    <Image src={src} alt={`Attached image ${index + 1}`} fill sizes="130px" className="object-cover" unoptimized />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(src)}
                                        aria-label={`Remove image ${index + 1}`}
                                        className="absolute top-1.5 right-1.5 inline-flex size-6 items-center justify-center rounded bg-black/60 text-white outline-none hover:bg-black/75 focus-visible:ring-[3px] focus-visible:ring-white/60"
                                    >
                                        <X className="size-3.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {project && (
                        <div className="flex items-center gap-2">
                            <PostProjectCard project={project} className="flex-1" />
                            <button type="button" onClick={() => setProject(null)} aria-label="Remove project" className={REMOVE}>
                                <X className="size-3.5" />
                            </button>
                        </div>
                    )}

                    {pickerOpen && !project && (
                        <div className="rounded ring-1 ring-foreground/10">
                            <div className="flex items-center gap-2 border-b border-border px-3">
                                <Search className="size-4 shrink-0 text-muted-foreground" />
                                <label htmlFor={`${fieldId}-project`} className="sr-only">
                                    Search projects
                                </label>
                                <input
                                    id={`${fieldId}-project`}
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Find a project by name or stack"
                                    autoComplete="off"
                                    autoFocus
                                    className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                                />
                                <button type="button" onClick={() => setPickerOpen(false)} aria-label="Close project search" className={REMOVE}>
                                    <X className="size-3.5" />
                                </button>
                            </div>
                            <ul className="thin-scrollbar max-h-56 overflow-y-auto p-1">
                                {results.length === 0 ? (
                                    <li className="px-3 py-4 text-sm text-muted-foreground">No projects match “{query}”.</li>
                                ) : (
                                    results.map((item) => (
                                        <li key={item.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setProject(item);
                                                    setPickerOpen(false);
                                                }}
                                                className="flex w-full items-center gap-3 rounded px-2 py-1.5 text-left outline-none hover:bg-foreground/5 focus-visible:bg-foreground/5"
                                            >
                                                <span className="relative h-8 w-11 shrink-0 overflow-hidden rounded-[6px] bg-primary/10">
                                                    <Image src={item.thumbnail} alt="" fill sizes="44px" className="object-cover" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-sm">{item.title}</span>
                                                    <span className="block truncate font-mono text-[11px] text-muted-foreground">
                                                        {item.techStack.slice(0, 3).join(', ')}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    )}

                    {quote && (
                        <div className="flex items-start gap-2">
                            <PostQuoteCard quote={quote} linked={false} className="flex-1" />
                            <button type="button" onClick={onClearQuote} aria-label="Remove quote" className={REMOVE}>
                                <X className="size-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <p id={errorId} role="alert" className="mt-2 text-xs text-destructive">
                        {error}
                    </p>
                )}

                <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="-ml-2 flex items-center gap-0.5">
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            tabIndex={-1}
                            aria-hidden
                            onChange={(event) => {
                                addImages(event.target.files);
                                event.target.value = '';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            disabled={images.length >= POST_MAX_IMAGES}
                            aria-label="Attach images"
                            title="Attach images"
                            className={TOOL}
                        >
                            <ImagePlus className="size-[18px]" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setCode(code ? null : { lang: 'typescript', code: '' })}
                            aria-pressed={!!code}
                            aria-label="Add a code block"
                            title="Add a code block"
                            className={TOOL}
                        >
                            <Code2 className="size-[18px]" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setPickerOpen((open) => !open)}
                            disabled={!!project}
                            aria-pressed={pickerOpen}
                            aria-label="Attach a Fiurozz project"
                            title="Attach a Fiurozz project"
                            className={TOOL}
                        >
                            <FolderGit2 className="size-[18px]" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {remaining <= 50 && (
                            <span className={cn('text-xs tabular-nums', remaining < 0 ? 'text-destructive' : 'text-muted-foreground')}>
                                {remaining}
                            </span>
                        )}
                        <Button type="submit" size="sm" disabled={!canSubmit}>
                            {isSubmitting ? (parent ? 'Replying…' : 'Posting…') : idleLabel}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}

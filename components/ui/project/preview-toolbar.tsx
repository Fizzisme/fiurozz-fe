'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowUpFromLine, Bookmark, Check, Globe, Link2, Lock, Pencil, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/animate-ui/components/buttons/button';
import { ArrowLeft } from '@/components/animate-ui/icons/arrow-left';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/global/select';
import { cn } from '@/lib/utils';
import type { ProjectVisibility } from '@/services/project-service';

export const VISIBILITY_OPTIONS: { value: ProjectVisibility; label: string; hint: string; icon: LucideIcon }[] = [
    { value: 'PUBLIC', label: 'Public', hint: 'Anyone can find and open it.', icon: Globe },
    { value: 'UNLISTED', label: 'Unlisted', hint: 'Only people with the link can open it.', icon: Link2 },
    { value: 'PRIVATE', label: 'Private', hint: 'Only you can see it.', icon: Lock },
];

interface PreviewToolbarProps {
    title: string;
    isEditing: boolean;
    onToggleEdit: () => void;
    /** Save is enabled only when there are unsaved edits. */
    canSave: boolean;
    onSave: () => void;
    visibility: ProjectVisibility;
    onVisibilityChange: (value: ProjectVisibility) => void;
    onPublish: () => void;
    isPublishing: boolean;
}

// Full-width bar pinned to the top of the draft preview:
// back + what you are looking at on the left, edit / save / publish on the right.
export default function PreviewToolbar({
    title,
    isEditing,
    onToggleEdit,
    canSave,
    onSave,
    visibility,
    onVisibilityChange,
    onPublish,
    isPublishing,
}: PreviewToolbarProps) {
    const visibilityHint = VISIBILITY_OPTIONS.find((option) => option.value === visibility)?.hint;

    return (
        <div
            role="toolbar"
            aria-label="Draft actions"
            className={cn(
                'sticky top-0 z-30 w-full border-b bg-background/85 backdrop-blur-md transition-colors duration-300',
                // The bottom edge picks up the accent while the page is editable.
                isEditing ? 'border-primary/60' : 'border-foreground/10',
            )}
        >
            <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
                {/* ------------------------------------------------ Left: back + identity */}
                <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="shrink-0 cursor-pointer rounded px-2 text-muted-foreground hover:text-foreground"
                >
                    <Link href="/projects/create" aria-label="Back to create project">
                        <AnimateIcon animateOnHover className="flex items-center gap-1">
                            <ArrowLeft />
                            <span className="hidden md:inline">Back</span>
                        </AnimateIcon>
                    </Link>
                </Button>

                <div className="h-6 w-px shrink-0 bg-foreground/10" aria-hidden />

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold leading-tight text-[#52514e] dark:text-[#c3c2b7]">
                        {title || 'Untitled project'}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs leading-tight text-muted-foreground">
                        <span
                            aria-hidden
                            className={cn(
                                'size-1.5 shrink-0 rounded-full',
                                isEditing ? 'bg-primary motion-safe:animate-pulse' : 'bg-[#c9bfb2]',
                            )}
                        />
                        <span className="font-medium text-foreground/80">{isEditing ? 'Editing' : 'Draft'}</span>
                        <span className="hidden truncate sm:inline">
                            {isEditing && canSave ? '· Unsaved changes' : '· Only you can see it'}
                        </span>
                    </p>
                </div>

                {/* ------------------------------------------------ Right: actions */}
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <Button
                        type="button"
                        variant={isEditing ? 'default' : 'outline'}
                        size="sm"
                        onClick={onToggleEdit}
                        disabled={isPublishing}
                        aria-pressed={isEditing}
                        aria-label={isEditing ? 'Done editing' : 'Edit'}
                        className="cursor-pointer rounded"
                    >
                        {isEditing ? <Check /> : <Pencil />}
                        <span className="hidden sm:inline">{isEditing ? 'Done' : 'Edit'}</span>
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onSave}
                        disabled={!canSave || isPublishing}
                        aria-label="Save changes"
                        className="cursor-pointer rounded"
                    >
                        <Bookmark />
                        <span className="hidden sm:inline">Save</span>
                    </Button>

                    <div className="mx-0.5 hidden h-6 w-px bg-foreground/10 sm:block" aria-hidden />

                    <Select
                        value={visibility}
                        onValueChange={(value) => onVisibilityChange(value as ProjectVisibility)}
                        disabled={isPublishing}
                    >
                        <SelectTrigger
                            size="sm"
                            aria-label="Visibility after publishing"
                            aria-describedby="preview-visibility-hint"
                            className="cursor-pointer gap-1.5 sm:w-[7.5rem]"
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="end" className="min-w-52">
                            {VISIBILITY_OPTIONS.map(({ value, label, hint, icon: Icon }) => (
                                <SelectItem
                                    key={value}
                                    value={value}
                                    className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                                >
                                    <Icon className="text-muted-foreground" />
                                    <span>{label}</span>
                                    <span className="sr-only">. {hint}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span id="preview-visibility-hint" className="sr-only">
                        {visibilityHint}
                    </span>

                    <Button
                        type="button"
                        size="sm"
                        onClick={onPublish}
                        disabled={isPublishing}
                        aria-label="Publish"
                        className="cursor-pointer rounded"
                    >
                        <ArrowUpFromLine />
                        <span className="hidden sm:inline">{isPublishing ? 'Publishing…' : 'Publish'}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

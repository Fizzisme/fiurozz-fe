'use client';

import * as React from 'react';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/global/badge';
import { Input } from '@/components/ui/global/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/global/popover';
import { cn } from '@/lib/utils';
import { projectService, type TagItem } from '@/services/project-service';

interface TagPickerProps {
    id: string;
    value: TagItem[];
    onChange: (next: TagItem[]) => void;
    maxItems: number;
    invalid?: boolean;
    describedBy?: string;
}

const SEARCH_DELAY_MS = 250;

// Combobox over GET /api/projects/tags?q=. Only existing tags can be chosen:
// BE has no endpoint to create a tag from a name.
// The list renders in a Popover portal because Card clips its children (overflow-hidden).
export default function TagPicker({ id, value, onChange, maxItems, invalid, describedBy }: TagPickerProps) {
    const listId = `${id}-options`;

    const [query, setQuery] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [results, setResults] = React.useState<TagItem[]>([]);
    const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading');
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const latestRequest = React.useRef(0);
    const anchorRef = React.useRef<HTMLDivElement>(null);

    const isFull = value.length >= maxItems;
    const isOpen = open && !isFull;
    const selectedIds = new Set(value.map((tag) => tag.id));
    const options = results.filter((tag) => !selectedIds.has(tag.id));
    const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;

    React.useEffect(() => {
        if (!open) return;

        const requestId = ++latestRequest.current;
        const timer = setTimeout(async () => {
            setStatus('loading');
            const items = await projectService.searchTags(query);

            // A newer search has started since; drop this answer.
            if (requestId !== latestRequest.current) return;

            if (items === null) {
                setResults([]);
                setStatus('error');
                return;
            }

            setResults(items);
            setActiveIndex(-1);
            setStatus('ready');
        }, SEARCH_DELAY_MS);

        return () => clearTimeout(timer);
    }, [query, open]);

    const select = (tag: TagItem) => {
        if (isFull) return;
        onChange([...value, tag]);
        setQuery('');
        setActiveIndex(-1);
    };

    const remove = (tagId: string) => {
        onChange(value.filter((tag) => tag.id !== tagId));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setOpen(true);
                setActiveIndex((index) => Math.min(index + 1, options.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
                break;
            case 'Enter':
                // Never submit the form from the search box.
                e.preventDefault();
                if (isOpen && activeOption) select(activeOption);
                break;
            case 'Escape':
                setOpen(false);
                break;
            case 'Backspace':
                if (query === '' && value.length > 0) remove(value[value.length - 1].id);
                break;
        }
    };

    return (
        <div className="space-y-2">
            {value.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                    {value.map((tag) => (
                        <li key={tag.id}>
                            <Badge variant="outline" className="h-auto gap-1 py-1 pr-1 pl-2 text-[13px]">
                                #{tag.displayName}
                                <button
                                    type="button"
                                    onClick={() => remove(tag.id)}
                                    aria-label={`Remove tag ${tag.displayName}`}
                                    className="cursor-pointer rounded p-0.5 hover:bg-foreground/10"
                                >
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        </li>
                    ))}
                </ul>
            )}

            <Popover open={isOpen} onOpenChange={(next) => !next && setOpen(false)}>
                <PopoverAnchor asChild>
                    <div ref={anchorRef}>
                        <Input
                            id={id}
                            role="combobox"
                            aria-expanded={isOpen}
                            aria-controls={listId}
                            aria-autocomplete="list"
                            aria-activedescendant={activeOption ? `${listId}-${activeOption.id}` : undefined}
                            aria-invalid={invalid}
                            aria-describedby={describedBy}
                            autoComplete="off"
                            disabled={isFull}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setOpen(true);
                            }}
                            onFocus={() => setOpen(true)}
                            onBlur={() => setOpen(false)}
                            onKeyDown={handleKeyDown}
                            placeholder={isFull ? `Limit of ${maxItems} tags reached` : 'Search tags, e.g. react'}
                        />
                    </div>
                </PopoverAnchor>

                <PopoverContent
                    align="start"
                    className="w-(--radix-popover-trigger-width) gap-0 p-1"
                    // Typing continues in the input: never move focus into the list.
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onCloseAutoFocus={(e) => e.preventDefault()}
                    // Clicking the input itself is not an "outside" click.
                    onInteractOutside={(e) => {
                        if (anchorRef.current?.contains(e.target as Node)) e.preventDefault();
                    }}
                >
                    <ul id={listId} role="listbox" className="max-h-60 overflow-auto">
                        {status === 'loading' && options.length === 0 && (
                            <li className="px-2 py-1.5 text-muted-foreground">Searching…</li>
                        )}

                        {status === 'error' && (
                            <li className="px-2 py-1.5 text-destructive">Couldn’t load tags. Type again to retry.</li>
                        )}

                        {status === 'ready' && options.length === 0 && (
                            <li className="px-2 py-1.5 text-muted-foreground">
                                {query.trim() ? `No tag matches “${query.trim()}”` : 'No more tags to add'}
                            </li>
                        )}

                        {options.map((tag, index) => (
                            <li
                                key={tag.id}
                                id={`${listId}-${tag.id}`}
                                role="option"
                                aria-selected={index === activeIndex}
                                // Keep focus in the input so onBlur does not close the list first.
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => select(tag)}
                                onMouseEnter={() => setActiveIndex(index)}
                                className={cn(
                                    'cursor-pointer rounded px-2 py-1.5',
                                    index === activeIndex && 'bg-accent text-accent-foreground',
                                )}
                            >
                                #{tag.displayName}
                            </li>
                        ))}
                    </ul>
                </PopoverContent>
            </Popover>
        </div>
    );
}

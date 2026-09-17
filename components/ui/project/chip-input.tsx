'use client';

import * as React from 'react';
import { Plus, X } from 'lucide-react';

import { Badge } from '@/components/ui/global/badge';
import { Input } from '@/components/ui/global/input';
import { uniqueItems } from '@/lib/project-form';

interface ChipInputProps {
    id: string;
    value: string[];
    onChange: (next: string[]) => void;
    maxItems: number;
    maxItemLength: number;
    suggestions?: readonly string[];
    placeholder?: string;
    invalid?: boolean;
    describedBy?: string;
}

const MAX_VISIBLE_SUGGESTIONS = 8;

// Free-text list input: Enter or comma turns the draft into a chip, Backspace on an
// empty draft removes the last chip, and suggestions add with one click.
export default function ChipInput({
    id,
    value,
    onChange,
    maxItems,
    maxItemLength,
    suggestions = [],
    placeholder,
    invalid,
    describedBy,
}: ChipInputProps) {
    const [draft, setDraft] = React.useState('');

    const isFull = value.length >= maxItems;
    const taken = new Set(value.map((item) => item.toLowerCase()));

    const add = (raw: string) => {
        const item = raw.trim().slice(0, maxItemLength);
        if (!item || isFull || taken.has(item.toLowerCase())) return false;
        onChange(uniqueItems([...value, item]));
        return true;
    };

    const remove = (item: string) => {
        onChange(value.filter((current) => current !== item));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            // Enter would otherwise submit the whole form.
            e.preventDefault();
            if (add(draft)) setDraft('');
            return;
        }

        if (e.key === 'Backspace' && draft === '' && value.length > 0) {
            remove(value[value.length - 1]);
        }
    };

    const needle = draft.trim().toLowerCase();
    const visibleSuggestions = suggestions
        .filter((suggestion) => !taken.has(suggestion.toLowerCase()))
        .filter((suggestion) => !needle || suggestion.toLowerCase().includes(needle))
        .slice(0, MAX_VISIBLE_SUGGESTIONS);

    return (
        <div className="space-y-2">
            {value.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                    {value.map((item) => (
                        <li key={item} className="max-w-full">
                            <Badge
                                variant="secondary"
                                className="h-auto max-w-full gap-1 py-1 pr-1 pl-2 text-left text-[13px] whitespace-normal"
                            >
                                <span className="break-words">{item}</span>
                                <button
                                    type="button"
                                    onClick={() => remove(item)}
                                    aria-label={`Remove ${item}`}
                                    className="cursor-pointer rounded p-0.5 hover:bg-foreground/10"
                                >
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        </li>
                    ))}
                </ul>
            )}

            <Input
                id={id}
                value={draft}
                maxLength={maxItemLength}
                autoComplete="off"
                disabled={isFull}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isFull ? `Limit of ${maxItems} reached` : placeholder}
                aria-invalid={invalid}
                aria-describedby={describedBy}
            />

            {!isFull && visibleSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {visibleSuggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => add(suggestion)}
                            className="inline-flex cursor-pointer items-center gap-1 rounded border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                        >
                            <Plus className="size-3" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

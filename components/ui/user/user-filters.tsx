'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/global/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/global/select';
import { MEMBER_ROLES, MEMBER_SKILLS, MEMBER_SORTS, type MemberSort } from '@/mock-data/members';

export interface MemberFilterState {
    q: string;
    role: string | null;
    skill: string | null;
    sort: MemberSort;
}

interface MemberFiltersProps {
    value: MemberFilterState;
    onChange: (next: MemberFilterState) => void;
    /** How many members the current filters match; null while the count is unknown. */
    resultCount: number | null;
    isLoading: boolean;
}

const ALL = '__all__';

/**
 * Selectable chip. The system's existing chips are read-only labels, so this
 * is its own control: accent fill when pressed, greige wash on hover, and the
 * house 3px focus ring. Sans, not mono — mono marks a fact, and this is a
 * button.
 */
function FilterChip({
    label,
    pressed,
    onClick,
}: {
    label: string;
    pressed: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            aria-pressed={pressed}
            onClick={onClick}
            className={`cursor-pointer rounded border px-2.5 py-1 text-xs font-medium outline-none transition-[background-color,border-color,color] duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 ${
                pressed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-foreground/10 text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
        >
            {label}
        </button>
    );
}

export default function MemberFilters({ value, onChange, resultCount, isLoading }: MemberFiltersProps) {
    // Local mirror so typing stays instant while the query is debounced upstream.
    const [draft, setDraft] = useState(value.q);

    useEffect(() => {
        if (draft === value.q) return;
        const id = setTimeout(() => onChange({ ...value, q: draft }), 300);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft]);

    const isFiltered = Boolean(value.q || value.role || value.skill) || value.sort !== 'followers';

    const clearAll = () => {
        setDraft('');
        onChange({ q: '', role: null, skill: null, sort: 'followers' });
    };

    return (
        <section aria-label="Filter members" className="mb-6">
            {/* SEARCH + SELECTS */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <label htmlFor="member-search" className="sr-only">
                        Search members
                    </label>
                    <Input
                        id="member-search"
                        type="search"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Search by name, handle or skill"
                        className="pl-9 pr-9 [&::-webkit-search-cancel-button]:appearance-none"
                    />
                    {draft && (
                        <button
                            type="button"
                            onClick={() => setDraft('')}
                            aria-label="Clear search"
                            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <Select
                    value={value.skill ?? ALL}
                    onValueChange={(v) => onChange({ ...value, skill: v === ALL ? null : v })}
                >
                    <SelectTrigger className="w-full sm:w-[168px]" aria-label="Filter by skill">
                        <SelectValue placeholder="Any skill" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Any skill</SelectItem>
                        {MEMBER_SKILLS.map((skill) => (
                            <SelectItem key={skill} value={skill}>
                                {skill}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={value.sort}
                    onValueChange={(v) => onChange({ ...value, sort: v as MemberSort })}
                >
                    <SelectTrigger className="w-full sm:w-[176px]" aria-label="Sort members">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {MEMBER_SORTS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* ROLE CHIPS */}
            <div className="mt-3 flex flex-wrap gap-2">
                <FilterChip
                    label="All roles"
                    pressed={value.role === null}
                    onClick={() => onChange({ ...value, role: null })}
                />
                {MEMBER_ROLES.map((role) => (
                    <FilterChip
                        key={role}
                        label={role}
                        pressed={value.role === role}
                        onClick={() => onChange({ ...value, role: value.role === role ? null : role })}
                    />
                ))}
            </div>

            {/* COUNT + RESET */}
            <div className="mt-4 flex items-center justify-between border-t border-foreground/10 pt-3">
                <p
                    aria-live="polite"
                    className="font-mono text-[11px] uppercase tracking-[0.14em] tabular-nums text-muted-foreground"
                >
                    {isLoading
                        ? 'Searching…'
                        : resultCount === null
                          ? ''
                          : `${resultCount} ${resultCount === 1 ? 'member' : 'members'}`}
                </p>

                {isFiltered && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="cursor-pointer rounded px-2 py-1 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        Clear all
                    </button>
                )}
            </div>
        </section>
    );
}

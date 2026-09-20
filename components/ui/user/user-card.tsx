'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MapPin, School, Send } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/global/avatar';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { Member } from '@/mock-data/members';
import { memberService } from '@/services/member-service';
import { useMessageDockStore } from '@/lib/store/message-dock-store';
import { useUserStore } from '@/lib/store/user-store';

interface MemberCardProps {
    member: Member;
    className?: string;
}

/**
 * Chips must never wrap to a second row (they would unpin the stack from the
 * footer and strand a lone `+N`), so the row is filled by character budget
 * rather than a fixed count: at most three, and only while they still fit.
 */
const MAX_SKILLS = 3;
const LABEL_BUDGET = 22;

function fitSkills(skills: string[]): string[] {
    const fitted: string[] = [];
    let used = 0;

    for (const skill of skills.slice(0, MAX_SKILLS)) {
        if (fitted.length > 0 && used + skill.length > LABEL_BUDGET) break;
        fitted.push(skill);
        used += skill.length;
    }

    return fitted;
}

/** Two initials, so a portrait that fails to load still reads as a person. */
function initials(name: string): string {
    return name
        .split(' ')
        .slice(0, 2)
        .map((part) => part[0] ?? '')
        .join('')
        .toUpperCase();
}

function formatCount(value: number): string {
    return value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${value}`;
}

/** "1 project", "9 projects" — an abbreviated count is always plural. */
function countLabel(value: number, singular: string): string {
    return `${formatCount(value)} ${value === 1 ? singular : `${singular}s`}`;
}

/**
 * The builder's calling card — the person-shaped sibling of the project
 * artifact, with the same bands and hover choreography.
 *
 * The header pairs the portrait with the two things you can do about a person,
 * the way the home member card does; the name then gets a line of its own
 * instead of competing with controls for the same row.
 *
 * The whole card opens the profile, but Follow and Message are real controls,
 * so this is a plain element carrying a stretched link on the name rather than
 * a `<Link>` wrapper: nesting a button inside an anchor is invalid markup and
 * breaks keyboard activation for both.
 */
export default function MemberCard({ member, className }: MemberCardProps) {
    const visible = fitSkills(member.skills);
    const overflow = member.skills.length - visible.length;

    const openConversation = useMessageDockStore((state) => state.openConversation);
    const user = useUserStore((state) => state.user);
    const isInitialized = useUserStore((state) => state.isInitialized);

    const router = useRouter();
    const pathname = usePathname();

    /**
     * Following and messaging both author something, so both are gated. Returns
     * true when the caller must stop: either auth is still unknown (act on it and
     * you risk bouncing someone who is in fact signed in) or there is no account,
     * in which case the visitor is sent to sign in and brought back here.
     */
    const blockedByAuth = () => {
        if (!isInitialized) return true;
        if (!user) {
            router.push(`/login?next=${encodeURIComponent(pathname)}`);
            return true;
        }
        return false;
    };

    const [isFollowing, setIsFollowing] = useState(member.isFollowing);
    const [followers, setFollowers] = useState(member.stats.followers);
    const [isPending, startTransition] = useTransition();

    const toggleFollow = () => {
        if (blockedByAuth()) return;

        const next = !isFollowing;
        const previous = { isFollowing, followers };

        // Optimistic: the control answers immediately, then reconciles with
        // whatever the server says the truth is.
        setIsFollowing(next);
        setFollowers((n) => n + (next ? 1 : -1));

        startTransition(async () => {
            try {
                const result = await memberService.setFollow(member.username, next);
                setIsFollowing(result.isFollowing);
                setFollowers(result.followers);
            } catch {
                setIsFollowing(previous.isFollowing);
                setFollowers(previous.followers);
            }
        });
    };

    return (
        <div
            className={`group/card relative flex h-full flex-col overflow-hidden rounded bg-card ring-1 ring-foreground/10 shadow-[0_20px_60px_-30px_rgba(30,25,20,0.35)] transition-shadow duration-300 hover:shadow-[0_28px_70px_-30px_rgba(30,25,20,0.45)] dark:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.6)] ${className ?? ''}`}
        >
            <div className="flex flex-1 flex-col px-4 pt-4 pb-4 sm:px-5 sm:pt-5">
                {/* HEADER — portrait on the left, what you can do on the right */}
                <div className="flex items-center justify-between gap-2">
                    <Avatar className="size-12 rounded-full ring-1 ring-foreground/10 after:rounded-full">
                        <AvatarImage
                            src={member.avatar}
                            alt=""
                            className="rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.06]"
                        />
                        <AvatarFallback className="rounded-full bg-primary/10 font-mono text-xs text-foreground/60">
                            {initials(member.name)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Same lockup as the home member card — a bare Send glyph beside a
                        ghost Follow — but each is a real control so both are reachable by
                        keyboard. Lifted above the stretched link so both stay clickable. */}
                    <div className="relative z-10 flex shrink-0 items-center gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                                if (blockedByAuth()) return;
                                openConversation(member.username);
                            }}
                            aria-label={`Message ${member.name}`}
                            title={`Message ${member.name}`}
                            className="hover:bg-transparent"
                        >
                            <Send className="size-6" />
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            onClick={toggleFollow}
                            disabled={isPending}
                            aria-pressed={isFollowing}
                            aria-label={isFollowing ? `Unfollow ${member.name}` : `Follow ${member.name}`}
                            className={`px-1 ${isFollowing ? 'text-muted-foreground' : ''}`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                    </div>
                </div>

                {/* NAME — its own line, carrying the stretched link for the card */}
                <div className="mt-3">
                    <h3 className="truncate text-lg font-semibold tracking-[-0.02em]">
                        <Link
                            href={`/profile/${member.username}`}
                            className="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        >
                            {member.name}
                        </Link>
                    </h3>
                    <p className="truncate font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                        @{member.username}
                    </p>
                </div>

                {/* THEIR LINE */}
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/80">{member.headline}</p>

                {/* FACTS */}
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <School className="size-3.5 shrink-0" />
                        <span className="truncate">{member.role}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 shrink-0" />
                        <span className="truncate">{member.location}</span>
                    </span>
                </div>

                {/* STACK — hairline mono chips, never filled; a run past three collapses */}
                <div className="mt-auto flex flex-nowrap items-center gap-2 pt-4">
                    {visible.map((skill) => (
                        <span
                            key={skill}
                            className="shrink-0 rounded border border-foreground/10 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                            {skill}
                        </span>
                    ))}
                    {overflow > 0 && (
                        <span className="shrink-0 font-mono text-[11px] text-muted-foreground/70">+{overflow}</span>
                    )}
                </div>
            </div>

            {/* FOOTER — what they have shipped */}
            <div className="border-t border-foreground/10 px-4 py-3 sm:px-5">
                <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {countLabel(member.stats.projects, 'project')}
                    <span className="mx-1.5 text-foreground/20">·</span>
                    {countLabel(followers, 'follower')}
                </p>
            </div>
        </div>
    );
}

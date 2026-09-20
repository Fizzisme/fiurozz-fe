import { CalendarDays, Cake, Link as LinkIcon, MapPin, UserPen } from 'lucide-react';
import type { ICurrentUser, ISocialLink } from '@/types/user';
import Github from '@/components/icons/github';
import Facebook from '@/components/icons/facebook';
import { Globe, Music2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/global/avatar';
import { Button } from '@/components/ui/global/button';
import { getInitials } from '@/lib/utils';
import Image from 'next/image';
import { TooltipContent, TooltipTrigger, Tooltip } from '@/components/animate-ui/components/animate/tooltip';
import Link from 'next/link';

type PlatformIcon = React.ComponentType<{
    className?: string;
    'aria-hidden'?: boolean;
}>;

const PLATFORM_ICON: Record<string, PlatformIcon> = {
    github: Github,
    // twitter: Twitter,
    // x: Twitter,
    // instagram: Instagram,
    // linkedin: Linkedin,
    // youtube: Youtube,
    facebook: Facebook,
    tiktok: Music2,
};

function formatJoined(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatBirthday(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function SocialLinks({ links }: { links: ISocialLink[] }) {
    if (links.length === 0) return null;
    const sorted = [...links].sort((a, b) => a.order - b.order);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {sorted.map((link) => {
                const Icon = PLATFORM_ICON[link.platform.toLowerCase()] ?? Globe;
                return (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        title={link.title ?? link.platform}
                        className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
                    >
                        <Icon aria-hidden />
                        {link.title ?? link.platform}
                    </a>
                );
            })}
        </div>
    );
}

export default function ProfileHeader({ user }: { user: ICurrentUser }) {
    return (
        <div className="overflow-hidden rounded border bg-sidebar">
            {/* Cover */}
            <div className="relative h-32 w-full bg-muted sm:h-48">
                {user.coverUrl && (
                    <Image
                        src={user.coverUrl}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 640px) 100vw, 768px"
                        className="object-cover"
                    />
                )}
            </div>

            <div className="flex flex-col gap-4 px-4 pb-4 sm:px-6 sm:pb-6">
                {/* Avatar + action row */}
                <div className="-mt-12 flex items-end justify-between sm:-mt-16">
                    <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                        <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                        <AvatarFallback className="text-2xl">
                            {getInitials(user.fullName ?? user.displayName)}
                        </AvatarFallback>
                    </Avatar>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="ghost"
                                className="h-[32px] w-[32px] [&_svg]:pointer-events-auto cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                            >
                                <Link href={`/profile/${user.displayName}/edit`}>
                                    <UserPen className="size-5 opacity-60 hover:opacity-80 transition-opacity" />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit Profile</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* Name + handle */}
                <div>
                    <h1 className="text-xl font-bold leading-tight text-[#52514e] dark:text-[#c3c2b7]">
                        {user.fullName}
                    </h1>
                    <p className="text-sm text-muted-foreground">@{user.displayName}</p>
                </div>

                {user.bio && <p className="max-w-2xl text-[15px] leading-relaxed">{user.bio}</p>}

                {/* Meta row: location / website / birthday / joined */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                    {user.location && (
                        <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            {user.location}
                        </span>
                    )}

                    {user.website && (
                        <a
                            href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                        >
                            <LinkIcon size={16} />
                            {user.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}

                    {user.birthday && user.settings?.showBirthday && (
                        <span className="flex items-center gap-1">
                            <Cake size={16} />
                            {formatBirthday(user.birthday)}
                        </span>
                    )}

                    <span className="flex items-center gap-1">
                        <CalendarDays size={16} />
                        Joined {formatJoined(user.createdAt)}
                    </span>
                </div>

                {/* Following / Followers */}
                <div className="flex items-center gap-4 text-sm">
                    <span className="hover:underline">
                        <strong className="font-semibold text-[#52514e] dark:text-[#c3c2b7]">0</strong>{' '}
                        <span className="text-muted-foreground">Following</span>
                    </span>
                    <span className="hover:underline">
                        <strong className="font-semibold text-[#52514e] dark:text-[#c3c2b7]">0</strong>{' '}
                        <span className="text-muted-foreground">Follower</span>
                    </span>
                </div>

                <SocialLinks links={user.links} />
            </div>
        </div>
    );
}

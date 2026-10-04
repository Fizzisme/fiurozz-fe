import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/animate-ui/components/radix/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/global/avatar';

// "Nguyen Le Tuan Phi" -> "NP"; shown while the image loads or when it is missing.
function initials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    const first = words[0][0];
    const last = words.length > 1 ? words[words.length - 1][0] : '';
    return (first + last).toUpperCase();
}

interface AuthorCardProps {
    name: string;
    email?: string;
    avatar?: string;
    bio?: string;

    side?: 'top' | 'bottom' | 'left' | 'right';
    sideOffset?: number;
    align?: 'start' | 'center' | 'end';
    alignOffset?: number;
    followCursor?: boolean | 'x' | 'y';
}

export default function AuthorCard({
    name,
    email,
    avatar,
    bio,

    side = 'bottom',
    sideOffset = 8,
    align = 'center',
    alignOffset = 0,
    followCursor = false,
}: AuthorCardProps) {
    const fallback = initials(name);

    return (
        <HoverCard followCursor={followCursor}>
            <HoverCardTrigger asChild>
                <button
                    type="button"
                    aria-label={`About ${name}`}
                    className="cursor-pointer rounded-full transition-opacity hover:opacity-80"
                >
                    <Avatar className="size-12">
                        {avatar && <AvatarImage src={avatar} alt={name}/>}
                        <AvatarFallback className="rounded-full font-medium">{fallback}</AvatarFallback>
                    </Avatar>
                </button>
            </HoverCardTrigger>

            <HoverCardContent
                side={side}
                sideOffset={sideOffset}
                align={align}
                alignOffset={alignOffset}
                className="w-80"
            >
                <div className="flex flex-col gap-4">
                    <Avatar className="size-16">
                        {avatar && <AvatarImage src={avatar} alt={name} />}
                        <AvatarFallback className="text-lg font-medium">{fallback}</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col gap-3">
                        <div>
                            <div className="font-bold text-lg">{name}</div>

                            {email && <div className="text-sm text-muted-foreground">{email}</div>}
                        </div>

                        {bio && <div className="text-sm text-muted-foreground">{bio}</div>}

                        <div className="text-xs text-muted-foreground">Project Author</div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

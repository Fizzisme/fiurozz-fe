'use client';

import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/animate-ui/components/animate/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/global/avatar';
import { getInitials } from '@/lib/utils';
import { useUserStore } from '@/lib/store/user-store';
import { authService } from '@/services/auth-service';
import { toast } from 'sonner';
import { User } from '@/components/animate-ui/icons/user';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { LogOut } from '@/components/animate-ui/icons/log-out';
import { Settings } from '@/components/animate-ui/icons/settings';
export function UserMenu() {
    const router = useRouter();
    const clearUser = useUserStore((state) => state.clearUser);
    const user = useUserStore((state) => state.user);

    if (!user) return null;

    const handleLogout = async () => {
        const res = await authService.logout();
        if (!res.success) toast.error('Logout failed.');
        clearUser();
        router.push('/login');
        router.refresh();
    };

    return (
        <Tooltip>
            <DropdownMenu>
                {/* TooltipTrigger (asChild) wraps DropdownMenuTrigger
                    (no asChild) -- DropdownMenuTrigger renders the one
                    real <button>, TooltipTrigger just attaches its
                    hover handlers onto that same node. */}
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger className="h-[25px] w-[25px] rounded overflow-hidden cursor-pointer outline-none">
                        <Avatar className="h-full w-full rounded">
                            <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                            <AvatarFallback className="text-[10px]">
                                {getInitials(user.fullName ?? user.displayName)}
                            </AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                </TooltipTrigger>

                <TooltipContent>
                    <p>{user.displayName}</p>
                </TooltipContent>

                <DropdownMenuContent align="end" className="min-w-[215px]">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <AnimateIcon animateOnHover>
                            <DropdownMenuItem onClick={() => router.push(`/profile/${user?.displayName}`)}>
                                <User />
                                Profile
                                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </AnimateIcon>
                        <AnimateIcon animateOnHover>
                            <DropdownMenuItem onClick={() => router.push('/member/settings')}>
                                <Settings />
                                Settings
                                <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        </AnimateIcon>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <AnimateIcon animateOnHover>
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut />
                            <span>Log out</span>
                            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </AnimateIcon>
                </DropdownMenuContent>
            </DropdownMenu>
        </Tooltip>
    );
}

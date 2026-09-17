'use client';

import { useRouter } from 'next/navigation';
import {
    SidebarFooter as SidebarFooterRadix,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/animate-ui/components/radix/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/global/avatar';
import { getInitials } from '@/lib/utils';
import { PlusCircle } from 'lucide-react';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Bell } from '@/components/animate-ui/icons/bell';
import { LogOut } from '@/components/animate-ui/icons/log-out';
import { ChevronUpDown } from '@/components/animate-ui/icons/chevron-up-down';
import { User } from '@/components/animate-ui/icons/user';
import { Settings } from '@/components/animate-ui/icons/settings';
import { useUserStore } from '@/lib/store/user-store';
import { authService } from '@/services/auth-service';
import LogoIcon from '@/components/icons/logo-icon';
import { useIsMobile } from '@/hooks/use-mobile';
import CatronautCoding from '@/components/ui/catronaut/coding';

export default function SidebarFooter() {
    const router = useRouter();
    const isMobile = useIsMobile();
    const user = useUserStore((state) => state.user);
    const clearUser = useUserStore((state) => state.clearUser);

    // --- CHƯA ĐĂNG NHẬP: bấm là đi thẳng /login, không mở dropdown ---
    // (trước đó là DropdownMenuTrigger disabled={!user} -> bấm không làm gì
    // cả, nút chết. Giờ tách hẳn 2 nhánh UI khác nhau cho rõ ràng.)
    if (!user) {
        return (
            <SidebarFooterRadix>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <AnimateIcon animateOnHover asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="cursor-pointer"
                                onClick={() => router.push('/login')}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-[#52514e] dark:text-[#c3c2b7]">
                                        {getInitials('Guest')}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-[#52514e] dark:text-[#c3c2b7]">
                                        Guest
                                    </span>
                                    <span className="truncate text-xs text-[#52514e] dark:text-[#c3c2b7]">
                                        Sign in to continue
                                    </span>
                                </div>
                                <ChevronUpDown className="ml-auto size-4 text-[#52514e] dark:text-[#c3c2b7]" />
                            </SidebarMenuButton>
                        </AnimateIcon>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooterRadix>
        );
    }

    // --- ĐÃ ĐĂNG NHẬP: dropdown đầy đủ, cùng pattern với UserMenu ---
    const handleLogout = async () => {
        const res = await authService.logout();
        if (!res.success) {
            alert('Logout failed');
            return;
        }
        clearUser();
        router.push('/login');
        router.refresh();
    };

    const mainMenuItems = [
        {
            label: 'Profile',
            icon: User,
            href: `/profile/${user.displayName}`,
        },
        {
            label: 'Settings',
            icon: Settings,
            href: '/profile/settings',
        },
        {
            label: 'Create Project',
            icon: PlusCircle,
            href: '/projects/create',
        },
        {
            label: 'Notifications',
            icon: Bell,
            href: '/notifications',
        },
    ];

    // DropdownMenuItem luôn render motion.div (không nhận asChild) nên không bọc <Link> được,
    // và router.push không tự prefetch. Prefetch lúc mở menu để khi bấm, loading.tsx của
    // trang đích hiện ngay. (Prefetch chỉ chạy ở production, ở dev là no-op.)
    const handleOpenChange = (open: boolean) => {
        if (!open) return;
        mainMenuItems.forEach((item) => router.prefetch(item.href));
    };

    return (
        <SidebarFooterRadix>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu onOpenChange={handleOpenChange}>
                        <DropdownMenuTrigger asChild>
                            <AnimateIcon animateOnHover>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatarUrl ?? ''} alt={user.displayName} />
                                        <AvatarFallback className="text-[#52514e] dark:text-[#c3c2b7]">
                                            {getInitials(user.fullName || user.displayName)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold text-[#52514e] dark:text-[#c3c2b7]">
                                            @{user.displayName}
                                        </span>
                                        <span className="truncate text-xs text-[#52514e] dark:text-[#c3c2b7]">
                                            {user.email}
                                        </span>
                                    </div>
                                    <ChevronUpDown className="ml-auto size-4 text-[#52514e] dark:text-[#c3c2b7]" />
                                </SidebarMenuButton>
                            </AnimateIcon>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded"
                            side={isMobile ? 'bottom' : 'right'}
                            sideOffset={-4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatarUrl ?? ''} alt={user.displayName} />
                                        <AvatarFallback className="text-[#52514e] dark:text-[#c3c2b7]">
                                            {getInitials(user.fullName ?? user.displayName)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold text-[#52514e] dark:text-[#c3c2b7]">
                                            @{user.displayName}
                                        </span>
                                        <span className="truncate text-xs text-[#52514e] dark:text-[#c3c2b7]">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* Upgrade */}
                            <DropdownMenuGroup>
                                <AnimateIcon animateOnHover>
                                    <DropdownMenuItem className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]">
                                        <CatronautCoding scale={0.3} />
                                        Upgrade to Pro
                                    </DropdownMenuItem>
                                </AnimateIcon>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            {/* Profile / Settings / Create Project / Notifications */}
                            <DropdownMenuGroup>
                                {mainMenuItems.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <AnimateIcon key={item.label} animateOnHover>
                                            <DropdownMenuItem
                                                onClick={() => router.push(item.href)}
                                                className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                                            >
                                                <Icon />
                                                {item.label}
                                            </DropdownMenuItem>
                                        </AnimateIcon>
                                    );
                                })}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <AnimateIcon animateOnHover>
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-[#52514e] dark:text-[#c3c2b7]"
                                >
                                    <LogOut />
                                    Log out
                                </DropdownMenuItem>
                            </AnimateIcon>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooterRadix>
    );
}

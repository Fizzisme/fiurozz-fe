'use client';

import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { LucideIcon, LogOut, User, Users, FolderKanban, Newspaper, Mail, LayoutGrid, Home, Search } from 'lucide-react';

import { useUserStore } from '@/lib/store/user-store';
import { RadialMenu } from '@/components/animate-ui/components/community/radial-menu';
import { authService } from '@/services/auth-service';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const navItems = [
    { label: 'Home', href: '/home' },
    { label: 'Projects', href: '/projects' },
    { label: 'Members', href: '/members' },
    { label: 'Posts', href: '/posts' },
    { label: 'Contact', href: '/contact' },
    { label: 'Search', href: '#' },
];

// Icon lucide tương ứng cho từng nav item theo label. "Members" bắt buộc
// dùng Users theo yêu cầu. Các label khác không khớp map sẽ fallback
// về LayoutGrid.
const NAV_ICON_MAP: Record<string, LucideIcon> = {
    Home: Home,
    Projects: FolderKanban,
    Members: Users,
    Posts: Newspaper,
    Contact: Mail,
    Search: Search,
};

type FloatingMenuBubbleProps = {
    className?: string;
};

const BUBBLE_SIZE = 56;
const BUBBLE_MARGIN = 4;
const DRAG_TAP_THRESHOLD = 6;

export function FloatingMenuBubble({ className = 'md:hidden' }: FloatingMenuBubbleProps) {
    const user = useUserStore((state) => state.user);
    const isInitialized = useUserStore((state) => state.isInitialized);
    const clearUser = useUserStore((state) => state.clearUser);
    const router = useRouter();

    const handleLogout = async () => {
        const res = await authService.logout();
        if (!res.success) toast.error('Logout failed.');
        clearUser();
        router.push('/login');
        router.refresh();
    };

    const bubbleX = useMotionValue(0);
    const bubbleY = useMotionValue(0);

    const [menuOpen, setMenuOpen] = useState(false);

    const gesture = useRef({
        pointerId: null as number | null,
        startClientX: 0,
        startClientY: 0,
        startBubbleX: 0,
        startBubbleY: 0,
        moved: false,
    });

    useEffect(() => {
        const initX = window.innerWidth - BUBBLE_SIZE - BUBBLE_MARGIN;
        const initY = window.innerHeight - BUBBLE_SIZE - BUBBLE_MARGIN - 24;
        bubbleX.set(initX);
        bubbleY.set(initY);
    }, [bubbleX, bubbleY]);

    const centerAnchor = useMemo(
        () => ({
            getBoundingClientRect: () => {
                const w = window.innerWidth;
                const h = window.innerHeight;
                return {
                    width: 0,
                    height: 0,
                    x: w / 2,
                    y: h / 2,
                    top: h / 2,
                    left: w / 2,
                    right: w / 2,
                    bottom: h / 2,
                    toJSON() {
                        return {};
                    },
                } as DOMRect;
            },
        }),
        [],
    );

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        gesture.current = {
            pointerId: e.pointerId,
            startClientX: e.clientX,
            startClientY: e.clientY,
            startBubbleX: bubbleX.get(),
            startBubbleY: bubbleY.get(),
            moved: false,
        };
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const g = gesture.current;
        if (g.pointerId !== e.pointerId) return;

        const dx = e.clientX - g.startClientX;
        const dy = e.clientY - g.startClientY;

        if (!g.moved && Math.hypot(dx, dy) > DRAG_TAP_THRESHOLD) {
            g.moved = true;
        }

        if (g.moved) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            bubbleX.set(clamp(g.startBubbleX + dx, 0, vw - BUBBLE_SIZE));
            bubbleY.set(clamp(g.startBubbleY + dy, 0, vh - BUBBLE_SIZE));
        }
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        const g = gesture.current;
        if (g.pointerId !== e.pointerId) return;

        (e.target as HTMLElement).releasePointerCapture(e.pointerId);

        if (!g.moved) {
            setMenuOpen(true);
            gesture.current.pointerId = null;
            return;
        }

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const x = bubbleX.get();
        const y = bubbleY.get();

        const distLeft = x;
        const distRight = vw - (x + BUBBLE_SIZE);
        const distTop = y;
        const distBottom = vh - (y + BUBBLE_SIZE);

        const minDist = Math.min(distLeft, distRight, distTop, distBottom);

        let targetX = x;
        let targetY = y;

        if (minDist === distLeft) {
            targetX = BUBBLE_MARGIN;
        } else if (minDist === distRight) {
            targetX = vw - BUBBLE_SIZE - BUBBLE_MARGIN;
        } else if (minDist === distTop) {
            targetY = BUBBLE_MARGIN;
        } else {
            targetY = vh - BUBBLE_SIZE - BUBBLE_MARGIN;
        }

        targetX = clamp(targetX, BUBBLE_MARGIN, vw - BUBBLE_SIZE - BUBBLE_MARGIN);
        targetY = clamp(targetY, BUBBLE_MARGIN, vh - BUBBLE_SIZE - BUBBLE_MARGIN);

        animate(bubbleX, targetX, { type: 'spring', stiffness: 400, damping: 32 });
        animate(bubbleY, targetY, { type: 'spring', stiffness: 400, damping: 32 });

        gesture.current.pointerId = null;
    };

    const { menuItems, actionsById } = useMemo(() => {
        const items: { id: number; label?: string; icon?: LucideIcon; avatarUrl?: string }[] = [];
        const actions: Record<number, () => void> = {};
        let id = 1;

        navItems.forEach((item) => {
            const currentId = id++;
            items.push({
                id: currentId,
                label: item.label,
                icon: NAV_ICON_MAP[item.label] ?? LayoutGrid,
            });
            actions[currentId] = () => {
                window.location.href = item.href;
            };
        });

        // Trạng thái tài khoản: chưa init -> chưa hiện gì; đã init mà
        // chưa đăng nhập -> icon User + "Login"; đã đăng nhập -> avatar
        // (chữ cái đầu tên) + item "Log out" riêng.
        if (isInitialized && user) {
            const avatarId = id++;
            items.push({
                id: avatarId,
                label: 'Profile',
                avatarUrl: user.avatarUrl || '',
            });
            actions[avatarId] = () => {};

            const logoutId = id++;
            items.push({ id: logoutId, label: 'Log out', icon: LogOut });
            actions[logoutId] = () => {
                handleLogout();
            };
        } else if (isInitialized) {
            const loginId = id++;
            items.push({ id: loginId, label: 'Login', icon: User });
            actions[loginId] = () => {
                window.location.href = '/login';
            };
        }

        return { menuItems: items, actionsById: actions };
    }, [user, isInitialized]);

    return (
        <div className={`${className} fixed inset-0 z-[60] pointer-events-none`}>
            <RadialMenu
                menuItems={menuItems}
                size={260}
                iconSize={20}
                bandWidth={64}
                innerGap={8}
                outerGap={8}
                outerRingWidth={12}
                open={menuOpen}
                onOpenChange={setMenuOpen}
                anchor={centerAnchor}
                onSelect={(item) => {
                    actionsById[item.id]?.();
                    setMenuOpen(false);
                }}
            >
                <AnimatePresence>
                    {!menuOpen && (
                        <motion.div
                            key="bubble"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerUp}
                            style={{ x: bubbleX, y: bubbleY, width: BUBBLE_SIZE, height: BUBBLE_SIZE }}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                            className="
        pointer-events-auto
        absolute
        top-0
        left-0
        z-10
        flex
        items-center
        justify-center
        cursor-grab
        active:cursor-grabbing
        select-none
        touch-none
        [&_img]:pointer-events-none
        [&_img]:drop-shadow-md
    "
                        >
                            <div className="w-8 h-8 bg-white absolute z-0"></div>
                            <div
                                className="h-2 w-4 bg-white absolute z-0"
                                style={{
                                    top: 5,
                                }}
                            ></div>
                            <div
                                className=" bg-white absolute z-0"
                                style={{
                                    top: 6,
                                    right: 15,
                                    width: '6px',
                                    height: '6px',
                                }}
                            ></div>
                            <div
                                className=" bg-white absolute z-0"
                                style={{
                                    top: 6,
                                    left: 15,
                                    width: '6px',
                                    height: '6px',
                                }}
                            ></div>
                            <div
                                className="h-2 w-3 bg-white absolute z-0"
                                style={{
                                    bottom: 5,
                                }}
                            ></div>
                            <div
                                className=" bg-white absolute z-0"
                                style={{
                                    bottom: 7,
                                    right: 16,
                                    width: '6px',
                                    height: '6px',
                                }}
                            ></div>
                            <div
                                className=" bg-white absolute z-0"
                                style={{
                                    bottom: 7,
                                    left: 16,
                                    width: '6px',
                                    height: '6px',
                                }}
                            ></div>
                            <div
                                className=" bg-white absolute z-0"
                                style={{
                                    top: 15,
                                    right: 8,
                                    width: '6px',
                                    height: '25px',
                                }}
                            ></div>
                            <div
                                className=" bg-white absolute z-0"
                                style={{
                                    top: 15,
                                    left: 8,
                                    width: '6px',
                                    height: '25px',
                                }}
                            ></div>
                            {/*<div*/}
                            {/*    className="h-2 w-5 bg-red-500 absolute z-20"*/}
                            {/*    style={{*/}
                            {/*        bottom: 5,*/}
                            {/*        right: 20,*/}
                            {/*    }}*/}
                            {/*></div>*/}
                            <Image
                                src="/logo/logo-light.png"
                                alt="Fiurozz"
                                width={BUBBLE_SIZE}
                                height={BUBBLE_SIZE}
                                draggable={false}
                                onDragStart={(e) => e.preventDefault()}
                                className="h-full w-full object-contain z-[1]"
                            />
                            {/*<Image*/}
                            {/*    src="/logo/logo-dark.png"*/}
                            {/*    alt="Fiurozz"*/}
                            {/*    width={BUBBLE_SIZE}*/}
                            {/*    height={BUBBLE_SIZE}*/}
                            {/*    draggable={false}*/}
                            {/*    onDragStart={(e) => e.preventDefault()}*/}
                            {/*    className="hidden dark:block h-full w-full object-contain"*/}
                            {/*/>*/}
                        </motion.div>
                    )}
                </AnimatePresence>
            </RadialMenu>
        </div>
    );
}

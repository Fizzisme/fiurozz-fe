'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

import CatronautLoading from '@/components/ui/catronaut/loading';
import CatronautSuccess from '@/components/ui/catronaut/success';
import CatronautError from '@/components/ui/catronaut/error';
import CatronautWarning from '@/components/ui/catronaut/warning';
import CatronautInfo from '@/components/ui/catronaut/info';

// Every toast type shows Catronaut acting the outcome out (pixel canvases from
// components/ui/catronaut). scale 1 keeps one art pixel per CSS pixel, so it stays crisp.
function NotificationMascot({ children }: { children: React.ReactNode }) {
    return (
        <span className="fz-toast-mascot" aria-hidden="true">
            {children}
        </span>
    );
}

// The app's single toast outlet, mounted once in app/layout.tsx.
// Anywhere in a client component: `import { toast } from 'sonner'`, then
// `toast.loading/success/error('...')` around an API call, instead of alert().
// The look (frosted iOS banner) lives in app/globals.css under "Toast".
export function Toaster(props: ToasterProps) {
    const { resolvedTheme } = useTheme();

    return (
        <Sonner
            theme={(resolvedTheme as ToasterProps['theme']) ?? 'system'}
            // Top-center, clear of the fixed header (56px, 82px from md);
            // bottom-right already belongs to MessageDock.
            position="top-center"
            offset={{ top: 96 }}
            mobileOffset={{ top: 64, left: 10, right: 10 }}
            gap={10}
            className="fz-toaster"
            style={{ '--width': '372px' } as React.CSSProperties}
            icons={{
                loading: (
                    <NotificationMascot>
                        <CatronautLoading scale={1} />
                    </NotificationMascot>
                ),
                success: (
                    <NotificationMascot>
                        <CatronautSuccess scale={1} />
                    </NotificationMascot>
                ),
                error: (
                    <NotificationMascot>
                        <CatronautError scale={1} />
                    </NotificationMascot>
                ),
                warning: (
                    <NotificationMascot>
                        <CatronautWarning scale={1} />
                    </NotificationMascot>
                ),
                info: (
                    <NotificationMascot>
                        <CatronautInfo scale={1} />
                    </NotificationMascot>
                ),
            }}
            // Unstyled: sonner keeps positioning, stacking and swipe-to-dismiss;
            // every visual comes from the fz-toast rules. No close button — swipe up, like iOS.
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: 'fz-toast',
                    icon: 'fz-toast-icon',
                    content: 'fz-toast-content',
                    title: 'fz-toast-title',
                    description: 'fz-toast-description',
                },
            }}
            {...props}
        />
    );
}

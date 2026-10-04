'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ImageViewerProps {
    /** Full-size image shown in the viewer. */
    src: string;
    alt: string;
    /** Classes for the trigger button that wraps the thumbnail. */
    className?: string;
    /** The thumbnail itself (an Avatar, a cover Image...). */
    children: React.ReactNode;
}

// Click-to-enlarge for profile images, like the avatar/cover viewers on social networks.
// Closes on Esc, on the X button, or on a click anywhere outside the image.
export default function ImageViewer({ src, alt, className, children }: ImageViewerProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Trigger asChild>
                <button
                    type="button"
                    aria-label={`View ${alt}`}
                    className={cn(
                        'cursor-zoom-in rounded focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                        className,
                    )}
                >
                    {children}
                </button>
            </DialogPrimitive.Trigger>

            <DialogPrimitive.Portal>
                <DialogPrimitive.Content
                    aria-describedby={undefined}
                    // The content itself is the dark backdrop, so a click on its empty area closes it.
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setOpen(false);
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
                >
                    <DialogPrimitive.Title className="sr-only">{alt}</DialogPrimitive.Title>

                    {/* eslint-disable-next-line @next/next/no-img-element -- BE-hosted file, shown at its own size */}
                    <img
                        src={src}
                        alt={alt}
                        // Google-hosted avatars can be refused when a Referer is sent (same as AvatarImage).
                        referrerPolicy="no-referrer"
                        className="max-h-[90vh] max-w-full rounded object-contain"
                    />

                    <DialogPrimitive.Close
                        aria-label="Close"
                        className="absolute right-4 top-4 flex size-9 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-white/50"
                    >
                        <X className="size-5" />
                    </DialogPrimitive.Close>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}

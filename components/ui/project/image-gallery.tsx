'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Item of the BE `media` list (already sorted by sortOrder): images, GIFs and at most one video.
export type GalleryMedia = { type: 'IMAGE' | 'GIF' | 'VIDEO'; url: string };

type ApiMedia = { mediaType: GalleryMedia['type']; url: string; sortOrder: number };

// Reads the BE `media` list off a project detail response (the mock Project type has no such
// field). Display order is sortOrder, except that a video always goes first.
export function getGalleryMedia(project: object): GalleryMedia[] {
    const media = (project as { media?: ApiMedia[] }).media ?? [];
    const sorted = [...media].sort((a, b) => a.sortOrder - b.sortOrder);

    return [...sorted.filter((m) => m.mediaType === 'VIDEO'), ...sorted.filter((m) => m.mediaType !== 'VIDEO')].map(
        ({ mediaType, url }) => ({ type: mediaType, url }),
    );
}

interface ImageGalleryProps {
    thumbnail?: string;
    images?: string[];
    /** When given, replaces thumbnail + images and may contain a video. */
    media?: GalleryMedia[];
    title: string;
}

// Ảnh có tracking thế hệ (generation) để Framer Motion nhận diện item "mới" khi bị đẩy xuống cuối
type GalleryItem = {
    id: string;
    src: string;
    gen: number;
    isVideo: boolean;
    /** BE-hosted files skip the Next image optimizer, so no remotePatterns entry is needed. */
    unoptimized: boolean;
};

// Image or video for one slot; videos get controls only where `controls` is set (the big views).
function MediaItem({
    item,
    alt,
    className,
    controls,
    sizes,
    priority,
    onClick,
}: {
    item: GalleryItem;
    alt: string;
    className: string;
    controls?: boolean;
    sizes?: string;
    priority?: boolean;
    onClick?: () => void;
}) {
    if (item.isVideo) {
        return (
            <video
                // #t=0.1 makes the browser paint the first frame as a poster.
                src={`${item.src}#t=0.1`}
                controls={controls}
                muted={!controls}
                playsInline
                preload="metadata"
                aria-label={alt}
                className={cn(className, 'bg-black')}
            />
        );
    }

    return (
        <Image
            src={item.src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            unoptimized={item.unoptimized}
            className={className}
            onClick={onClick}
        />
    );
}

export default function ImageGallery({ thumbnail, images = [], media, title }: ImageGalleryProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [items, setItems] = useState<GalleryItem[]>(() => {
        if (media) {
            return media.map((m, i) => ({
                id: `img-${i}`,
                src: m.url,
                gen: 0,
                isVideo: m.type === 'VIDEO',
                unoptimized: true,
            }));
        }

        const allSrc = [thumbnail, ...images].filter((src): src is string => !!src);

        return allSrc.map((src, i) => ({
            id: `img-${i}`,
            src,
            gen: 0,
            isVideo: false,
            unoptimized: false,
        }));
    });

    // Ảnh active luôn là phần tử đầu tiên
    const activeItem = items[0];

    const handleThumbnailClick = (clickedItem: GalleryItem) => {
        const index = items.findIndex((item) => item.id === clickedItem.id && item.gen === clickedItem.gen);

        if (index === 0) {
            setIsModalOpen(true);
            return;
        }

        const itemsToMove = items.slice(0, index);
        const itemsToStay = items.slice(index);

        const movedItemsWithNewGen = itemsToMove.map((item) => ({
            ...item,
            gen: item.gen + 1,
        }));

        setItems([...itemsToStay, ...movedItemsWithNewGen]);
    };

    const nextModalImage = () => {
        const first = items[0];
        const rest = items.slice(1);
        setItems([...rest, { ...first, gen: first.gen + 1 }]);
    };

    const prevModalImage = () => {
        const last = items[items.length - 1];
        const rest = items.slice(0, -1);
        setItems([last, ...rest]);
    };

    return (
        <>
            {/* select-none: clicking thumbnails quickly would otherwise highlight the page as a double-click selection. */}
            <div className="mb-6 w-full relative group select-none">
                {/* --- ẢNH CHÍNH (LỚN) --- */}
                <div className="w-full overflow-hidden rounded-lg shadow-sm border bg-muted aspect-video relative">
                    <AnimatePresence>
                        <motion.div
                            key={activeItem.src}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                            className="w-full h-full absolute inset-0"
                        >
                            {/* A video keeps its native controls, so it does not open the modal on click. */}
                            <MediaItem
                                item={activeItem}
                                alt={title}
                                priority
                                controls
                                className={cn('h-full w-full', activeItem.isVideo ? 'object-contain' : 'object-cover cursor-pointer')}
                                onClick={() => setIsModalOpen(true)}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* --- THUMBNAIL CAROUSEL (GÓC DƯỚI PHẢI) --- */}
                {items.length > 1 && (
                    <div className="absolute bottom-4 right-4 z-5 w-auto">
                        <div className="flex gap-3 p-2 rounded-xl backdrop-blur-md bg-black/30 border border-white/10 shadow-xl overflow-hidden">
                            <motion.div className="flex gap-3">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {items.slice(0, 3).map((item, index) => {
                                        const uniqueKey = `${item.id}-gen-${item.gen}`;

                                        return (
                                            <motion.div
                                                key={uniqueKey}
                                                layout="position"
                                                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                                                animate={{
                                                    opacity: 1,
                                                    x: 0,
                                                    scale: index === 0 ? 1 : 1,
                                                    borderColor: index === 0 ? 'var(--primary)' : 'transparent',
                                                    filter: index === 0 ? 'brightness(100%)' : 'brightness(70%)',
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    x: -50,
                                                    scale: 0.5,
                                                    zIndex: -1,
                                                    transition: { duration: 0.3 },
                                                }}
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 300,
                                                    damping: 25,
                                                    mass: 1,
                                                }}
                                                onClick={() => handleThumbnailClick(item)}
                                                className={cn(
                                                    'relative w-20 h-14 md:w-24 md:h-16 flex-shrink-0 cursor-pointer',
                                                    'rounded-md overflow-hidden border-2 shadow-sm transition-colors',
                                                    index === 0
                                                        ? 'border-primary ring-2 ring-primary/30 z-10'
                                                        : 'border-white/40 hover:border-white hover:filter-none',
                                                )}
                                            >
                                                <MediaItem
                                                    item={item}
                                                    alt="thumbnail"
                                                    sizes="100px"
                                                    className="h-full w-full object-cover"
                                                />
                                                {item.isVideo && (
                                                    <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                        <Play size={18} className="fill-white text-white" />
                                                    </span>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODAL FULLSCREEN --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm select-none"
                    >
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-5 right-5 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white z-50"
                        >
                            <X size={24} />
                        </button>

                        {items.length > 1 && (
                            <>
                                <button
                                    onClick={prevModalImage}
                                    className="absolute left-4 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white z-50"
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={nextModalImage}
                                    className="absolute right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 text-white z-50"
                                >
                                    <ChevronRight size={32} />
                                </button>
                            </>
                        )}

                        <div className="w-full h-full p-4 md:p-10 flex items-center justify-center">
                            <motion.div
                                key={activeItem.src}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', duration: 0.4 }}
                                className="relative w-full h-full"
                            >
                                <MediaItem item={activeItem} alt={title} controls className="h-full w-full object-contain" />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

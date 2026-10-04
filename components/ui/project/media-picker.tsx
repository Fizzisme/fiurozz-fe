'use client';

import * as React from 'react';
import { ArrowLeft, ArrowRight, Plus, UploadCloud, Video, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
    IMAGE_TYPES,
    IMAGES_MAX,
    VIDEO_TYPES,
    validateImageFile,
    validateVideoFile,
} from '@/lib/project-form';

interface MediaPickerProps {
    images: File[];
    video?: File;
    onImagesChange: (next: File[]) => void;
    onVideoChange: (next?: File) => void;
    /** Message from the last pick, or from submit/BE validation. */
    imagesError?: string;
    videoError?: string;
    /** Called when a picked file is rejected, so the form can show the reason. */
    onPickError: (field: 'images' | 'video', message: string) => void;
    disabled?: boolean;
}

// Object URLs for previews; revoked when the file leaves the list or the picker unmounts.
function useObjectUrls(files: File[]) {
    const urls = React.useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
    React.useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls]);
    return urls;
}

// Dashed drop target shared by the three empty/add states. A <label> around a visually hidden
// input keeps it keyboard-focusable; drag & drop is layered on top of the same input.
function Dropzone({
    id,
    accept,
    multiple,
    disabled,
    invalid,
    describedBy,
    onFiles,
    className,
    children,
}: {
    id: string;
    accept: string;
    multiple?: boolean;
    disabled?: boolean;
    invalid?: boolean;
    describedBy: string;
    onFiles: (files: File[]) => void;
    className?: string;
    children: React.ReactNode;
}) {
    const [isDragging, setIsDragging] = React.useState(false);

    return (
        <label
            htmlFor={id}
            onDragOver={(e) => {
                if (disabled) return;
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (!disabled) onFiles(Array.from(e.dataTransfer.files));
            }}
            className={cn(
                'group flex cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed text-center transition-colors',
                'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50',
                invalid
                    ? 'border-destructive bg-destructive/5'
                    : 'border-zinc-300 hover:border-zinc-400 hover:bg-muted/50 dark:border-zinc-700 dark:hover:border-zinc-500',
                isDragging && 'border-zinc-500 bg-muted/60 dark:border-zinc-400',
                disabled && 'pointer-events-none opacity-50',
                className,
            )}
        >
            <input
                id={id}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                onChange={(e) => {
                    onFiles(Array.from(e.target.files ?? []));
                    e.target.value = ''; // let the same file be picked again after removing it
                }}
                className="sr-only"
            />
            {children}
        </label>
    );
}

export default function MediaPicker({
    images,
    video,
    onImagesChange,
    onVideoChange,
    imagesError,
    videoError,
    onPickError,
    disabled,
}: MediaPickerProps) {
    const videoFiles = React.useMemo(() => (video ? [video] : []), [video]);
    const imageUrls = useObjectUrls(images);
    const [videoUrl] = useObjectUrls(videoFiles);

    const addImages = (picked: File[]) => {
        if (picked.length === 0) return;
        const invalid = picked.map(validateImageFile).find(Boolean);
        if (invalid) return onPickError('images', invalid);
        if (images.length + picked.length > IMAGES_MAX) {
            return onPickError('images', `You can add at most ${IMAGES_MAX} images.`);
        }
        onImagesChange([...images, ...picked]);
    };

    const addVideo = (picked: File[]) => {
        const file = picked[0];
        if (!file) return;
        const invalid = validateVideoFile(file);
        if (invalid) return onPickError('video', invalid);
        onVideoChange(file);
    };

    const move = (from: number, to: number) => {
        const next = [...images];
        [next[from], next[to]] = [next[to], next[from]];
        onImagesChange(next);
    };

    const imageAccept = IMAGE_TYPES.join(',');

    return (
        <div className="space-y-6 text-[#52514e] dark:text-[#c3c2b7]">
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Images</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {images.length}/{IMAGES_MAX}
                    </span>
                </div>

                {images.length === 0 ? (
                    <Dropzone
                        id="project-images"
                        accept={imageAccept}
                        multiple
                        disabled={disabled}
                        invalid={!!imagesError}
                        describedBy="project-images-message"
                        onFiles={addImages}
                        className="p-8"
                    >
                        <span className="rounded-full bg-muted p-3 transition-colors group-hover:bg-background">
                            <UploadCloud
                                className={cn('h-6 w-6', imagesError ? 'text-destructive' : 'text-muted-foreground')}
                                aria-hidden
                            />
                        </span>
                        <span className={cn('text-sm font-medium', imagesError && 'text-destructive')}>
                            Drop images here, or click to upload
                        </span>
                        <span className="text-xs text-muted-foreground">JPG, PNG, WebP or GIF · up to 5MB each</span>
                    </Dropzone>
                ) : (
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {images.map((file, index) => (
                            <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`} className="space-y-1">
                                <div className="group relative aspect-video overflow-hidden rounded border border-zinc-200 bg-muted dark:border-zinc-800">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imageUrls[index]} alt={file.name} className="h-full w-full object-cover" />
                                    {index === 0 && (
                                        <span className="absolute left-1.5 top-1.5 rounded bg-background/90 px-1.5 py-0.5 text-xs">
                                            Thumbnail
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => onImagesChange(images.filter((_, i) => i !== index))}
                                        disabled={disabled}
                                        aria-label={`Remove ${file.name}`}
                                        className="absolute right-1.5 top-1.5 cursor-pointer rounded-full bg-black/50 p-1 text-white opacity-0 transition hover:bg-red-500 focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => move(index, index - 1)}
                                        disabled={disabled || index === 0}
                                        aria-label={`Move ${file.name} earlier`}
                                        className="cursor-pointer rounded p-1 disabled:cursor-default disabled:opacity-30"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => move(index, index + 1)}
                                        disabled={disabled || index === images.length - 1}
                                        aria-label={`Move ${file.name} later`}
                                        className="cursor-pointer rounded p-1 disabled:cursor-default disabled:opacity-30"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </li>
                        ))}

                        {images.length < IMAGES_MAX && (
                            <li>
                                <Dropzone
                                    id="project-images"
                                    accept={imageAccept}
                                    multiple
                                    disabled={disabled}
                                    invalid={!!imagesError}
                                    describedBy="project-images-message"
                                    onFiles={addImages}
                                    className="aspect-video gap-1"
                                >
                                    <Plus className="h-6 w-6 text-muted-foreground" aria-hidden />
                                    <span className="text-xs font-medium text-muted-foreground">Add</span>
                                </Dropzone>
                            </li>
                        )}
                    </ul>
                )}

                <p
                    id="project-images-message"
                    className={cn('text-xs', imagesError ? 'text-destructive' : 'text-muted-foreground')}
                >
                    {imagesError || 'Required: 3 to 5 images. The first one is the cover; use the arrows to reorder.'}
                </p>
            </div>

            <div className="space-y-2">
                <span className="text-sm font-medium">Video</span>

                {video && videoUrl ? (
                    <div className="space-y-1">
                        <video
                            src={videoUrl}
                            controls
                            className="aspect-video w-full rounded-lg border border-zinc-200 bg-muted dark:border-zinc-800"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="truncate">{video.name}</span>
                            <button
                                type="button"
                                onClick={() => onVideoChange(undefined)}
                                disabled={disabled}
                                className="cursor-pointer underline"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ) : (
                    <Dropzone
                        id="project-video"
                        accept={VIDEO_TYPES.join(',')}
                        disabled={disabled}
                        invalid={!!videoError}
                        describedBy="project-video-message"
                        onFiles={addVideo}
                        className="p-6"
                    >
                        <Video
                            className={cn('h-6 w-6', videoError ? 'text-destructive' : 'text-muted-foreground')}
                            aria-hidden
                        />
                        <span className={cn('text-sm font-medium', videoError && 'text-destructive')}>
                            Drop a video here, or click to upload
                        </span>
                        <span className="text-xs text-muted-foreground">MP4 or WebM · up to 50MB</span>
                    </Dropzone>
                )}

                <p
                    id="project-video-message"
                    className={cn('text-xs', videoError ? 'text-destructive' : 'text-muted-foreground')}
                >
                    {videoError || 'Optional.'}
                </p>
            </div>
        </div>
    );
}

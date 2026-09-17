import { Skeleton } from '@/components/ui/global/skeleton';

// Own boundary: without it this route inherits projects/loading.tsx (the project-grid
// skeleton). The shape mirrors views/ProjectPreview.tsx: draft bar, header, gallery, author.
export default function ProjectPreviewLoading() {
    return (
        <div className="py-5" aria-busy="true">
            <span className="sr-only" role="status">
                Loading project preview…
            </span>

            <div className="container mx-auto max-w-5xl px-4 lg:px-0">
                <Skeleton className="mb-4 h-9 w-20" />

                {/* Draft bar */}
                <div className="mb-6 flex flex-col gap-3 rounded border border-foreground/10 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-64 max-w-full" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>

                {/* Header */}
                <div className="mb-8 space-y-3">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>

                {/* Gallery */}
                <Skeleton className="mb-6 aspect-video w-full rounded-lg" />

                {/* Author */}
                <div className="mb-8 flex items-center gap-2">
                    <Skeleton className="size-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-44" />
                    </div>
                </div>
            </div>
        </div>
    );
}

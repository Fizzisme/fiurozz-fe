import { Skeleton } from '@/components/ui/global/skeleton';

interface MemberCardSkeletonProps {
    className?: string;
}

/**
 * Mirrors MemberCard's own bands and its hairline-separated footer rather than
 * one flat rectangle, so the grid doesn't jump when real cards swap in.
 */
export default function MemberCardSkeleton({ className }: MemberCardSkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={`flex h-full flex-col overflow-hidden rounded bg-card ring-1 ring-foreground/10 ${className ?? ''}`}
        >
            <div className="flex flex-1 flex-col px-4 pt-4 pb-4 sm:px-5 sm:pt-5">
                {/* HEADER — portrait left, actions right */}
                <div className="flex items-center justify-between gap-2">
                    <Skeleton className="size-12 shrink-0 rounded-full" />
                    <div className="flex shrink-0 items-center gap-3">
                        <Skeleton className="size-6 rounded-sm" />
                        <Skeleton className="h-5 w-14" />
                    </div>
                </div>

                {/* NAME */}
                <div className="mt-3">
                    <Skeleton className="h-5 w-2/5" />
                    <Skeleton className="mt-1.5 h-2.5 w-1/4" />
                </div>

                {/* THEIR LINE — two lines, matching line-clamp-2 */}
                <Skeleton className="mt-3 h-3.5 w-full" />
                <Skeleton className="mt-1.5 h-3.5 w-3/5" />

                {/* FACTS */}
                <div className="mt-3 flex gap-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>

                {/* STACK */}
                <div className="mt-auto flex gap-2 pt-4">
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-12" />
                </div>
            </div>

            {/* FOOTER */}
            <div className="border-t border-foreground/10 px-4 py-3 sm:px-5">
                <Skeleton className="h-2.5 w-36" />
            </div>
        </div>
    );
}

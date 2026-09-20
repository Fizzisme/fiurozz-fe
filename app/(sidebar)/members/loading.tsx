import UserCardSkeleton from '@/components/ui/user/user-card-skeleton';
import { Skeleton } from '@/components/ui/global/skeleton';
import { USER_ROLES } from '@/mock-data/users';
import { PAGE_SIZE } from '@/lib/constanst';

/**
 * Must mirror every band of views/Users.tsx, not just the grid — the filter
 * bar sits between the intro and the cards, so leaving it out here drops the
 * grid ~130px and the whole page jumps when the real view takes over.
 *
 * The role chips carry their real labels at `text-transparent`, so each
 * placeholder is exactly as wide as the chip that replaces it.
 */
export default function MembersLoading() {
    return (
        <div className="w-full px-4 sm:px-8 md:pl-8 md:pr-4 lg:pl-12 lg:pr-6 pb-6">
            <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <h1 className="text-2xl font-semibold tracking-[-0.02em]">Members</h1>
            </header>

            <p className="mb-6 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                Find other builders, see what they ship, and follow the ones whose work you want to keep up with.
            </p>

            {/* FILTER BAR — heights must stay in step with UserFilters */}
            <section aria-hidden="true" className="mb-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 w-full sm:w-[168px]" />
                    <Skeleton className="h-9 w-full sm:w-[176px]" />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    {['All roles', ...USER_ROLES].map((role) => (
                        <span
                            key={role}
                            className="animate-pulse rounded border border-transparent bg-muted px-2.5 py-1 text-xs font-medium text-transparent"
                        >
                            {role}
                        </span>
                    ))}
                </div>

                <div className="mt-4 flex items-center border-t border-foreground/10 pt-3">
                    {/* Same type as the real count line, so the line box matches to the pixel */}
                    <p className="animate-pulse rounded bg-muted font-mono text-[11px] uppercase tracking-[0.14em] text-transparent">
                        00 members
                    </p>
                </div>
            </section>

            {/* Grid columns must stay in step with views/Users.tsx */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <UserCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

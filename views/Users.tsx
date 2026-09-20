'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { type Member } from '@/mock-data/members';
import MemberCard from '@/components/ui/member/member-card';
import MemberCardSkeleton from '@/components/ui/member/member-card-skeleton';
import MemberFilters, { type MemberFilterState } from '@/components/ui/member/member-filters';
import { PAGE_SIZE } from '@/lib/constanst';
import { memberService } from '@/services/member-service';

interface MembersProps {
    initialMembers: Member[];
    initialCursor: string | null;
    initialHasMore: boolean;
    initialTotal: number;
}

const INITIAL_FILTERS: MemberFilterState = { q: '', role: null, skill: null, sort: 'followers' };

const filterKey = (f: MemberFilterState) => `${f.q}|${f.role}|${f.skill}|${f.sort}`;

const GRID = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4';

export default function Members({
    initialMembers,
    initialCursor,
    initialHasMore,
    initialTotal,
}: MembersProps) {
    const [members, setMembers] = useState<Member[]>(initialMembers);
    const [cursor, setCursor] = useState<string | null>(initialCursor);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [total, setTotal] = useState<number | null>(initialTotal);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [filters, setFilters] = useState<MemberFilterState>(INITIAL_FILTERS);

    const sentinelRef = useRef<HTMLDivElement>(null);
    const isFetchingRef = useRef(false);
    /**
     * The filters the list on screen already reflects. Comparing against this
     * rather than a "first render" flag keeps the server-rendered first page
     * from being re-fetched — including under StrictMode's double effect call.
     */
    const appliedKeyRef = useRef(filterKey(INITIAL_FILTERS));
    /** Only the newest filter request may write state — an earlier slow one must not win. */
    const requestIdRef = useRef(0);

    const reduceMotion = useReducedMotion();

    // Re-query from the top whenever the filters change.
    useEffect(() => {
        const key = filterKey(filters);
        if (key === appliedKeyRef.current) return;
        appliedKeyRef.current = key;

        const requestId = ++requestIdRef.current;
        setIsFiltering(true);

        memberService
            .getMembers({ cursor: null, limit: PAGE_SIZE, ...filters })
            .then((result) => {
                if (requestId !== requestIdRef.current) return;
                setMembers(result.items);
                setCursor(result.nextCursor);
                setHasMore(result.hasMore);
                setTotal(result.total);
            })
            .catch(() => {
                // Cho phép thử lại: nếu không, chữ ký đã ghi nhận sẽ chặn
                // mọi lần quay lại đúng bộ lọc vừa hỏng.
                if (requestId === requestIdRef.current) appliedKeyRef.current = '';
            })
            .finally(() => {
                if (requestId === requestIdRef.current) setIsFiltering(false);
            });
    }, [filters]);

    const loadMore = useCallback(async () => {
        if (isFetchingRef.current || !hasMore || isFiltering) return;
        isFetchingRef.current = true;
        setIsLoadingMore(true);

        const requestId = requestIdRef.current;

        try {
            const result = await memberService.getMembers({ cursor, limit: PAGE_SIZE, ...filters });

            // A filter change landed mid-flight — that response owns the list now.
            if (requestId === requestIdRef.current) {
                setMembers((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id));
                    return [...prev, ...result.items.filter((item) => !existingIds.has(item.id))];
                });
                setCursor(result.nextCursor);
                setHasMore(result.hasMore);
            }
        } finally {
            // Phải nằm trong finally: một lần reject mà không nhả cờ này là
            // infinite scroll chết hẳn, không còn lần tải nào nữa.
            setIsLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [cursor, hasMore, isFiltering, filters]);

    useEffect(() => {
        if (!hasMore) return;

        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { rootMargin: '600px 0px' },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    // The one authored moment: a result set settles into place when it changes.
    const gridKey = filterKey(filters);
    const container = {
        hidden: {},
        shown: { transition: { staggerChildren: reduceMotion ? 0 : 0.03 } },
    };
    const piece = reduceMotion
        ? { hidden: { opacity: 1 }, shown: { opacity: 1 } }
        : {
              hidden: { opacity: 0, y: 8 },
              shown: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
              },
          };

    return (
        <div className="w-full px-4 sm:px-8 md:pl-8 md:pr-4 lg:pl-12 lg:pr-6 pb-6">
            <header className="flex h-16 shrink-0 items-center transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <h1 className="text-2xl font-semibold tracking-[-0.02em]">Members</h1>
            </header>

            <p className="mb-6 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
                Find other builders, see what they ship, and follow the ones whose work you want to keep up with.
            </p>

            <MemberFilters value={filters} onChange={setFilters} resultCount={total} isLoading={isFiltering} />

            {isFiltering ? (
                <div className={GRID}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <MemberCardSkeleton key={`filter-skeleton-${i}`} />
                    ))}
                </div>
            ) : members.length === 0 ? (
                <div className="rounded border border-dashed border-foreground/15 px-6 py-20 text-center">
                    <p className="text-sm font-medium">No members match these filters.</p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                        Try a different skill, or clear the filters to see everyone.
                    </p>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={gridKey}
                        variants={container}
                        initial="hidden"
                        animate="shown"
                        className={GRID}
                    >
                        {members.map((member) => (
                            <motion.div key={member.id} variants={piece}>
                                <MemberCard member={member} />
                            </motion.div>
                        ))}

                        {isLoadingMore &&
                            Array.from({ length: 4 }).map((_, i) => (
                                <MemberCardSkeleton key={`more-skeleton-${i}`} />
                            ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {hasMore && !isFiltering && <div ref={sentinelRef} aria-hidden="true" className="h-1 w-full" />}
        </div>
    );
}

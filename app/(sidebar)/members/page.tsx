import Users from '@/views/Users';
import { userService } from '@/services/user-service';
import { PAGE_SIZE } from '@/lib/constanst';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Members',
    description: 'Find other builders on Fiurozz.',
};

export default async function MembersPage() {
    const { items, nextCursor, hasMore, total } = await userService.getUsers({
        cursor: null,
        limit: PAGE_SIZE,
    });

    return (
        <Users initialUsers={items} initialCursor={nextCursor} initialHasMore={hasMore} initialTotal={total} />
    );
}

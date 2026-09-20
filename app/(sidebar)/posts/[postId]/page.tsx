import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import PostThread from '@/views/PostThread';
import { postService } from '@/services/post-service';

interface PostThreadPageProps {
    params: Promise<{ postId: string }>;
    searchParams: Promise<{ reply?: string | string[] }>;
}

export async function generateMetadata({ params }: PostThreadPageProps): Promise<Metadata> {
    const { postId } = await params;
    const thread = await postService.getThread(postId);

    if (!thread) {
        return { title: 'Post Not Found' };
    }

    return {
        title: `${thread.post.author.fullName} on Fiurozz`,
        description: thread.post.text.slice(0, 160),
    };
}

export default async function PostThreadPage({ params, searchParams }: PostThreadPageProps) {
    const [{ postId }, { reply }] = await Promise.all([params, searchParams]);
    const thread = await postService.getThread(postId);

    if (!thread) notFound();

    return <PostThread thread={thread} autoFocusReply={reply === '1'} />;
}

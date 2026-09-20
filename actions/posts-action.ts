'use server';

import { gatewayClient, ApiError } from '@/services/gateway-client';
import { getCurrentUserAction } from '@/actions/user-action';
import {
    createMockPost,
    fetchPostsCursorPage as fetchMockPostsCursorPage,
    getPostThread as getMockPostThread,
    searchPostProjects as searchMockPostProjects,
    setMockPostViewerState,
    POST_CODE_MAX_LENGTH,
    POST_MAX_IMAGES,
    POST_MAX_LENGTH,
    type CreatePostInput,
    type GetPostsCursorParams,
    type Post,
    type PostAuthor,
    type PostInteraction,
    type PostProject,
    type PostsCursorPage,
    type PostThread,
    type PostViewerState,
} from '@/mock-data/posts';

export type CreatePostResult = { ok: true; post: Post } | { ok: false; message: string };

const EMPTY_PAGE: PostsCursorPage = { items: [], nextCursor: null, hasMore: false };

/** BE lỗi nhưng vẫn trả envelope có data thì dùng data đó; còn lại rơi về mock. */
function payloadData<T>(error: unknown): T | null {
    if (error instanceof ApiError && error.payload) {
        return (error.payload as { data?: T | null }).data ?? null;
    }
    return null;
}

export async function getPostsCursorPageAction(params: GetPostsCursorParams = {}): Promise<PostsCursorPage> {
    try {
        // TODO: real url
        const envelope = await gatewayClient.get<PostsCursorPage>('/posts', {
            query: {
                feed: params.feed ?? undefined,
                cursor: params.cursor ?? undefined,
                limit: params.limit,
            },
        });
        return envelope.data ?? EMPTY_PAGE;
    } catch (error) {
        // MockData
        return payloadData<PostsCursorPage>(error) ?? fetchMockPostsCursorPage(params);
    }
}

export async function getPostThreadAction(postId: string): Promise<PostThread | null> {
    try {
        // TODO: real url
        const envelope = await gatewayClient.get<PostThread>(`/posts/${postId}`);
        return envelope.data ?? null;
    } catch (error) {
        return payloadData<PostThread>(error) ?? getMockPostThread(postId);
    }
}

export async function searchPostProjectsAction(q: string): Promise<PostProject[]> {
    // Chưa có endpoint tìm project theo từ khoá — dùng mock trực tiếp.
    return searchMockPostProjects(q);
}

export async function createPostAction(input: CreatePostInput): Promise<CreatePostResult> {
    const user = await getCurrentUserAction();
    if (!user) return { ok: false, message: 'Sign in to post.' };

    const text = input.text.trim();
    const code = input.code && input.code.code.trim() ? { lang: input.code.lang, code: input.code.code } : null;
    const images = input.images.filter((src) => typeof src === 'string').slice(0, POST_MAX_IMAGES);

    if (text.length > POST_MAX_LENGTH) return { ok: false, message: `Keep it under ${POST_MAX_LENGTH} characters.` };
    if (code && code.code.length > POST_CODE_MAX_LENGTH) return { ok: false, message: 'That code block is too long.' };
    if (!text && !code && images.length === 0 && !input.projectId && !input.quoteId) {
        return { ok: false, message: 'Write something first.' };
    }

    const payload: CreatePostInput = { ...input, text, code, images };

    try {
        // TODO: real url — ảnh sẽ cần upload thật (multipart) khi BE sẵn sàng
        const envelope = await gatewayClient.post<Post>('/posts', { body: payload });
        if (envelope.data) return { ok: true, post: envelope.data };
    } catch (error) {
        const post = payloadData<Post>(error);
        if (post) return { ok: true, post };
    }

    const author: PostAuthor = {
        id: user.id,
        fullName: user.fullName ?? user.displayName,
        displayName: user.displayName,
        avatar: user.avatarUrl,
        role: user.occupation,
    };
    return { ok: true, post: createMockPost(payload, author) };
}

const INTERACTION_PATHS: Record<keyof PostViewerState, string> = {
    liked: 'like',
    reposted: 'repost',
    bookmarked: 'bookmark',
};

/**
 * Like / repost / bookmark. Trả về trạng thái BE chốt lại để client đồng bộ
 * số đếm sau khi cập nhật lạc quan; null = không thực hiện được (chưa đăng nhập).
 */
export async function setPostViewerStateAction(
    postId: string,
    key: keyof PostViewerState,
    value: boolean,
): Promise<PostInteraction | null> {
    const user = await getCurrentUserAction();
    if (!user) return null;

    try {
        // TODO: real url
        const path = `/posts/${postId}/${INTERACTION_PATHS[key]}`;
        const envelope = value
            ? await gatewayClient.post<PostInteraction>(path)
            : await gatewayClient.delete<PostInteraction>(path);
        if (envelope.data) return envelope.data;
    } catch (error) {
        const data = payloadData<PostInteraction>(error);
        if (data) return data;
    }

    return setMockPostViewerState(postId, key, value);
}

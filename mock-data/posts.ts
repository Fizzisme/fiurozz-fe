// ============================================================
// MOCK POSTS
// Fixture cho trang /posts khi backend chưa có endpoint posts.
// Tác giả lấy từ mockUsers, project đính kèm lấy từ mockProjects,
// để một bài post nối được sang /members và /projects.
// Đây là dữ liệu giả lập — không bao giờ trình bày như hoạt động thật.
// ============================================================

import { mockUsers, OCCUPATION_LABELS } from '@/mock-data/users';
import { type IUserSummary } from '@/types/user';
import { mockProjects, type Project } from '@/mock-data/projects';

// ============================================================
// GIỚI HẠN — dùng chung cho validate phía client và server action
// ============================================================

export const POST_MAX_LENGTH = 500;
export const POST_CODE_MAX_LENGTH = 4000;
export const POST_MAX_IMAGES = 4;

export const POST_CODE_LANGUAGES = [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'tsx', label: 'TSX' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'go', label: 'Go' },
    { value: 'java', label: 'Java' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
] as const;

// ============================================================
// TYPES
// ============================================================

export type PostFeed = 'for-you' | 'following';

export interface PostAuthor {
    id: string;
    fullName: string;
    displayName: string;
    avatar: string | null;
    role: string | null;
}

export interface PostCode {
    lang: string;
    code: string;
}

/** Bản rút gọn của một Project, đủ để hiện thẻ đính kèm trong bài */
export interface PostProject {
    id: string;
    title: string;
    href: string;
    thumbnail: string;
    categoryTitle: string;
    techStack: string[];
}

/** Snapshot của bài được trích dẫn, để bài quote vẫn đọc được khi bài gốc đổi */
export interface PostQuote {
    id: string;
    author: PostAuthor;
    text: string;
    createdAt: string;
}

export interface PostStats {
    likes: number;
    replies: number;
    reposts: number;
}

/** Trạng thái của người đang xem với bài này (BE trả theo từng viewer) */
export interface PostViewerState {
    liked: boolean;
    reposted: boolean;
    bookmarked: boolean;
}

export interface Post {
    id: string;
    author: PostAuthor;
    text: string;
    code: PostCode | null;
    images: string[];
    project: PostProject | null;
    quote: PostQuote | null;
    /** id bài cha nếu đây là một reply, null nếu là bài gốc */
    parentId: string | null;
    /** ISO date */
    createdAt: string;
    stats: PostStats;
    viewer: PostViewerState;
}

export interface PostsCursorPage {
    items: Post[];
    nextCursor: string | null;
    hasMore: boolean;
}

export interface GetPostsCursorParams {
    feed?: PostFeed | null;
    /** id của bài cuối cùng đã load, null = lấy từ đầu */
    cursor?: string | null;
    limit?: number;
}

export interface PostThread {
    post: Post;
    parent: Post | null;
    replies: Post[];
}

export interface CreatePostInput {
    text: string;
    code: PostCode | null;
    images: string[];
    projectId: string | null;
    quoteId: string | null;
    parentId: string | null;
}

export interface PostInteraction {
    stats: PostStats;
    viewer: PostViewerState;
}

// ============================================================
// NGUỒN SINH DỮ LIỆU
// ============================================================

function hash(seed: number, salt: number): number {
    let x = Math.imul(seed + salt * 0x9e37, 0x85eb) ^ 0x27d4;
    x = Math.imul(x ^ (x >>> 15), 0xc2b2);
    x ^= x >>> 13;
    return Math.abs(x);
}

interface PostSeed {
    text: string;
    code?: PostCode;
    images?: number;
    project?: boolean;
    /** index của seed được trích dẫn */
    quote?: number;
}

const SEEDS: PostSeed[] = [
    {
        text: 'Finally shipped dark mode for my portfolio. The trick was defining every colour as a token first — the toggle itself took ten minutes after that.',
        images: 2,
    },
    {
        text: 'Hot take: most apps don’t need a global state library. Server state in a cache plus URL state for filters covers 90% of it.',
    },
    {
        text: 'Spent two hours on a bug that turned out to be a missing `await`. Writing it here so future me remembers.',
        code: {
            lang: 'typescript',
            code: '// before — user is a Promise, user.name is undefined\nconst user = getUser(id);\n\n// after\nconst user = await getUser(id);',
        },
    },
    {
        text: 'What’s everyone using for E2E tests these days? Playwright has been solid for me, curious what else people like.',
    },
    {
        text: 'Rewrote our pagination from offset to cursor. Infinite scroll stopped showing duplicates the moment a new row got inserted.',
        code: {
            lang: 'typescript',
            code: "const rows = await db.post.findMany({\n  take: limit + 1,\n  cursor: cursor ? { id: cursor } : undefined,\n  orderBy: { createdAt: 'desc' },\n});\n\nconst hasMore = rows.length > limit;",
        },
    },
    {
        text: 'Small CSS thing that made my week: `text-wrap: balance` on headings. No more lonely last word on its own line.',
        code: { lang: 'css', code: 'h1, h2, h3 {\n  text-wrap: balance;\n}\n\np {\n  text-wrap: pretty;\n}' },
    },
    {
        text: 'Looking for a backend dev to pair on a small booking app — Nest.js + Postgres. Weekends only, just for fun. Reply if you’re interested.',
    },
    {
        text: 'Reminder that `useEffect` is for syncing with something outside React, not for deriving state from props.',
    },
    {
        text: 'My first project is up on Fiurozz. Feedback on the landing page is very welcome — please be honest.',
        project: true,
    },
    {
        text: 'Today I learned Postgres can index a single key inside a JSONB column. The query went from 1.2s to 40ms.',
        code: { lang: 'sql', code: "CREATE INDEX idx_events_type\n  ON events ((payload->>'type'));" },
    },
    {
        text: 'Is it just me or does every side project start as a todo app and end as a design system?',
    },
    {
        text: 'Docker multi-stage builds took our image from 1.1GB to 180MB. Should have done this months ago.',
        code: {
            lang: 'bash',
            code: '# compile in a full image, ship a slim one\ndocker build --target build -t app:build .\ndocker build -t app:latest .',
        },
    },
    {
        text: 'Working on keyboard navigation for a data table. Roving tabindex is a lot more fiddly than I expected.',
        images: 1,
    },
    {
        text: 'Best code review comment I got this year: “this works, but will you understand it in six months?”',
    },
    {
        text: 'Microservices are great right up until you need a transaction across three of them.',
    },
    {
        text: 'Made a tiny hook I keep copying between projects:',
        code: {
            lang: 'tsx',
            code: 'function useDebounced<T>(value: T, ms = 300) {\n  const [debounced, setDebounced] = useState(value);\n\n  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), ms);\n    return () => clearTimeout(id);\n  }, [value, ms]);\n\n  return debounced;\n}',
        },
    },
    {
        text: 'Context timeouts in Go handlers — set them once and thank yourself during the next outage.',
        code: {
            lang: 'go',
            code: 'func handler(w http.ResponseWriter, r *http.Request) {\n\tctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)\n\tdefer cancel()\n\n\trespond(ctx, w)\n}',
        },
    },
    {
        text: 'New cover shots for my project page. Which one reads better at a glance?',
        images: 3,
    },
    {
        text: 'Shipped v2 of my side project — rebuilt every chart and it finally loads fast on mobile.',
        project: true,
    },
    {
        text: 'Late-night coding soundtrack recommendations? Lo-fi is starting to wear thin.',
    },
    { text: 'This is the hook everyone should have in their utils folder.', quote: 15 },
    { text: 'Counterpoint: sometimes you really do need a store. Undo/redo across a whole editor is one of those times.', quote: 1 },
    { text: 'Went through exactly this last month. Cursor pagination is one of those changes you never regret.', quote: 4 },
];

const REPLY_TEXTS = [
    'Saving this for later, thanks for sharing.',
    'Did you try Vitest for the unit side? It pairs nicely with Playwright.',
    'Cursor pagination was a game changer for us too.',
    'Could you share the repo? Would love to see how you structured it.',
    'Same bug bit me last week.',
    'Clean. The spacing in the second shot is really nice.',
    'Hard agree on URL state for filters.',
    'Happy to pair on this — which timezone are you in?',
    '`text-wrap: pretty` on paragraphs is underrated too.',
    'This deserves more attention.',
    'How did you handle the edge case where the cursor row gets deleted?',
];

const MINUTE = 60_000;

function toAuthor(user: IUserSummary): PostAuthor {
    return {
        id: user.id,
        fullName: user.fullName ?? user.displayName,
        displayName: user.displayName,
        avatar: user.avatarUrl,
        role: user.occupation ? OCCUPATION_LABELS[user.occupation] : null,
    };
}

function toPostProject(project: Project): PostProject {
    return {
        id: project.id,
        title: project.title,
        href: `/projects/${project.categorySlug}/${project.subCategorySlug}/${project.slug}`,
        thumbnail: project.thumbnail,
        categoryTitle: project.subCategoryTitle,
        techStack: project.techStack,
    };
}

function toQuote(post: Post): PostQuote {
    return { id: post.id, author: post.author, text: post.text, createdAt: post.createdAt };
}

// ============================================================
// GENERATE
// ============================================================

function generateMockPosts(): Post[] {
    const now = Date.now();
    const roots: Post[] = [];
    const replies: Post[] = [];

    SEEDS.forEach((seed, index) => {
        const author = mockUsers[(index * 7 + 3) % mockUsers.length];
        // Bài càng về cuối danh sách seed càng cũ, trải trong khoảng ~2 ngày
        const createdAt = now - (index * 125 + 18 + (hash(index, 3) % 40)) * MINUTE;

        const post: Post = {
            id: `post-${String(index + 1).padStart(3, '0')}`,
            author: toAuthor(author),
            text: seed.text,
            code: seed.code ?? null,
            images: Array.from(
                { length: seed.images ?? 0 },
                (_, k) => `https://picsum.photos/seed/fiurozz-post-${index}-${k}/960/720`,
            ),
            project: seed.project ? toPostProject(mockProjects[(index * 3) % mockProjects.length]) : null,
            quote: seed.quote !== undefined && roots[seed.quote] ? toQuote(roots[seed.quote]) : null,
            parentId: null,
            createdAt: new Date(createdAt).toISOString(),
            stats: {
                likes: 3 + (hash(index, 11) % 240),
                replies: 0,
                reposts: hash(index, 17) % 18,
            },
            viewer: {
                liked: hash(index, 23) % 5 === 0,
                reposted: false,
                bookmarked: hash(index, 29) % 11 === 0,
            },
        };

        roots.push(post);

        const replyCount = hash(index, 5) % 5;
        for (let j = 0; j < replyCount; j += 1) {
            const replier = mockUsers[(index * 5 + j * 11 + 1) % mockUsers.length];
            replies.push({
                id: `${post.id}-r${j + 1}`,
                author: toAuthor(replier),
                text: REPLY_TEXTS[(index + j * 3) % REPLY_TEXTS.length],
                code: null,
                images: [],
                project: null,
                quote: null,
                parentId: post.id,
                createdAt: new Date(createdAt + (j + 1) * 3 * MINUTE).toISOString(),
                stats: { likes: hash(index * 13 + j, 31) % 24, replies: 0, reposts: 0 },
                viewer: { liked: false, reposted: false, bookmarked: false },
            });
        }
        post.stats.replies = replyCount;
    });

    return [...roots, ...replies];
}

const mockPosts: Post[] = generateMockPosts();

// ============================================================
// TRUY VẤN
// ============================================================

const newestFirst = (a: Post, b: Post) => b.createdAt.localeCompare(a.createdAt);
const oldestFirst = (a: Post, b: Post) => a.createdAt.localeCompare(b.createdAt);

/**
 * Cursor pagination, cùng quy ước với users/projects: cursor = id của bài
 * cuối cùng đã lấy. "following" chỉ giữ bài của user mà viewer đang follow.
 */
export function getPostsCursorPage({ feed = 'for-you', cursor = null, limit = 10 }: GetPostsCursorParams = {}): PostsCursorPage {
    let source = mockPosts.filter((post) => post.parentId === null);

    if (feed === 'following') {
        const followed = new Set(mockUsers.filter((m) => m.isFollowing).map((m) => m.displayName));
        source = source.filter((post) => followed.has(post.author.displayName));
    }

    source = [...source].sort(newestFirst);

    const startIndex = cursor ? source.findIndex((post) => post.id === cursor) + 1 : 0;
    if (cursor && startIndex === 0) {
        return { items: [], nextCursor: null, hasMore: false };
    }

    const items = source.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + limit;
    const hasMore = nextIndex < source.length;

    return { items, nextCursor: hasMore ? source[nextIndex - 1].id : null, hasMore };
}

/** Giả lập độ trễ mạng cho các lần tải thêm phía client */
export async function fetchPostsCursorPage(params: GetPostsCursorParams = {}, delayMs = 500): Promise<PostsCursorPage> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return getPostsCursorPage(params);
}

export function getPostThread(postId: string): PostThread | null {
    const post = mockPosts.find((item) => item.id === postId);
    if (!post) return null;

    return {
        post,
        parent: post.parentId ? (mockPosts.find((item) => item.id === post.parentId) ?? null) : null,
        replies: mockPosts.filter((item) => item.parentId === postId).sort(oldestFirst),
    };
}

/** Project gợi ý khi gắn vào bài, tìm theo tên / công nghệ */
export function searchPostProjects(q: string, limit = 6): PostProject[] {
    const keyword = q.trim().toLowerCase();
    const source = keyword
        ? mockProjects.filter(
              (project) =>
                  project.title.toLowerCase().includes(keyword) ||
                  project.techStack.some((tech) => tech.toLowerCase().includes(keyword)),
          )
        : mockProjects;

    return source.slice(0, limit).map(toPostProject);
}

// ============================================================
// GHI — đổi thẳng trên fixture để mock cư xử như BE có state
// ============================================================

let createdCount = 0;

export function createMockPost(input: CreatePostInput, author: PostAuthor): Post {
    const quoted = input.quoteId ? mockPosts.find((item) => item.id === input.quoteId) : undefined;
    const project = input.projectId ? mockProjects.find((item) => item.id === input.projectId) : undefined;
    const parent = input.parentId ? mockPosts.find((item) => item.id === input.parentId) : undefined;

    createdCount += 1;
    const post: Post = {
        id: `post-new-${Date.now().toString(36)}-${createdCount}`,
        author,
        text: input.text,
        code: input.code,
        images: input.images.slice(0, POST_MAX_IMAGES),
        project: project ? toPostProject(project) : null,
        quote: quoted ? toQuote(quoted) : null,
        parentId: parent ? parent.id : null,
        createdAt: new Date().toISOString(),
        stats: { likes: 0, replies: 0, reposts: 0 },
        viewer: { liked: false, reposted: false, bookmarked: false },
    };

    if (parent) parent.stats.replies += 1;
    mockPosts.unshift(post);
    return post;
}

type ToggleKey = keyof PostViewerState;

const COUNTED: Partial<Record<ToggleKey, keyof PostStats>> = {
    liked: 'likes',
    reposted: 'reposts',
};

export function setMockPostViewerState(postId: string, key: ToggleKey, value: boolean): PostInteraction | null {
    const post = mockPosts.find((item) => item.id === postId);
    if (!post) return null;

    if (post.viewer[key] !== value) {
        post.viewer[key] = value;
        const stat = COUNTED[key];
        if (stat) post.stats[stat] = Math.max(0, post.stats[stat] + (value ? 1 : -1));
    }

    return { stats: { ...post.stats }, viewer: { ...post.viewer } };
}

// ============================================================
// MOCK USERS
// Fixture behind the /members page, used whenever the user-service call fails.
// Types live in types/user.ts; this file holds the domain constants the UI
// reads plus the fixture itself.
// ============================================================

import type { Gender, IUserSummary, IUsersCursorPage, IUsersQueries, Occupation, UserSort } from '@/types/user';

// ============================================================
// DATA SOURCE
// ============================================================

const NAMES = [
    'Tuan Phi',
    'Van Thai',
    'Minh Anh',
    'Ngoc Han',
    'Quoc Bao',
    'Thu Trang',
    'Hoang Long',
    'Bao Chau',
    'Duy Khang',
    'Kim Ngan',
    'Gia Huy',
    'Thanh Tam',
    'Tien Dat',
    'Phuong Uyen',
    'Nhat Minh',
    'Khanh Linh',
    'Trung Kien',
    'My Duyen',
    'Hai Dang',
    'Tuong Vi',
    'Anh Tuan',
    'Le Vy',
    'Dang Khoa',
    'Thuy Tien',
    'Quang Vinh',
    'Hong Nhung',
    'Xuan Bach',
    'Cam Tu',
    'Huu Phuoc',
    'Dieu Linh',
    'Tan Loc',
    'Mai Chi',
    'Nguyen Vu',
    'Hoai Thuong',
    'Dinh Nam',
    'Thao Nguyen',
    'Viet Hung',
    'Bich Ngoc',
    'Cong Danh',
    'Yen Nhi',
    'Truong Son',
    'Kieu Trang',
    'Ba Duy',
    'Lan Huong',
    'The Anh',
    'Tuyet Mai',
    'Sy Nguyen',
    'Ha Vy',
];

export const USER_ROLES = [
    'Student',
    'Frontend Developer',
    'Backend Developer',
    'Fullstack Developer',
    'UI/UX Designer',
    'Mobile Developer',
    'DevOps Engineer',
    'Data Engineer',
];

/** The label to show for a stored occupation. USER_ROLES is the filterable subset. */
export const OCCUPATION_LABELS: Record<Occupation, string> = {
    STUDENT: 'Student',
    FRONTEND_DEVELOPER: 'Frontend Developer',
    BACKEND_DEVELOPER: 'Backend Developer',
    FULLSTACK_DEVELOPER: 'Fullstack Developer',
    MOBILE_DEVELOPER: 'Mobile Developer',
    SOFTWARE_ENGINEER: 'Software Engineer',
    DEVOPS_ENGINEER: 'DevOps Engineer',
    DATA_ENGINEER: 'Data Engineer',
    DATA_ANALYST: 'Data Analyst',
    UI_UX_DESIGNER: 'UI/UX Designer',
    PRODUCT_MANAGER: 'Product Manager',
    QA: 'QA',
    AI_ENGINEER: 'AI Engineer',
    BA: 'BA',
    OTHER: 'Other',
};

/** Inverse of OCCUPATION_LABELS, so the label-based role filter resolves to an enum value. */
const OCCUPATION_BY_ROLE: Record<string, Occupation> = Object.fromEntries(
    (Object.entries(OCCUPATION_LABELS) as [Occupation, string][]).map(([value, label]) => [label, value]),
);

const GENDERS: Gender[] = ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN'];

const LOCATIONS = ['Pleiku', 'Ha Noi', 'Da Nang', 'Ho Chi Minh City', 'Can Tho', 'Hue', 'Nha Trang', 'Hai Phong'];

const BIO = [
    'Building things that load fast.',
    'Shipping small, shipping often.',
    'I care about the details nobody notices.',
    'Turning coffee into components.',
    'Learning in public.',
    'Design first, then code.',
    'Making the web feel lighter.',
    'Side projects are my main hobby.',
];

export const USER_SKILLS = [
    'React',
    'Next.js',
    'TypeScript',
    'Node.js',
    'NestJS',
    'Spring Boot',
    'PostgreSQL',
    'MongoDB',
    'Tailwind CSS',
    'GSAP',
    'Docker',
    'Figma',
];

// ============================================================
// HELPERS
// ============================================================

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * Integer -> integer hash, deterministic and non-linear.
 * Needed because `index * k % n` locks fields together: every user with the
 * same role would get the same bio and location, making the page look broken.
 */
function hash(seed: number, salt: number): number {
    let x = Math.imul(seed + salt * 0x9e37, 0x85eb) ^ 0x27d4;
    x = Math.imul(x ^ (x >>> 15), 0xc2b2);
    x ^= x >>> 13;
    return Math.abs(x);
}

/** Pseudo-random but deterministic, based on an integer seed */
function pick<T>(arr: T[], seed: number, salt = 0): T {
    return arr[hash(seed, salt) % arr.length];
}

function pad(num: number, size = 3): string {
    return num.toString().padStart(size, '0');
}

/** Picks n distinct skills from USER_SKILLS, still deterministic by seed */
function pickSkills(seed: number, count: number): string[] {
    const skills: string[] = [];
    for (let i = 0; skills.length < count && i < USER_SKILLS.length * 2; i += 1) {
        const skill = USER_SKILLS[hash(seed, 90 + i) % USER_SKILLS.length];
        if (!skills.includes(skill)) skills.push(skill);
    }
    return skills;
}

// ============================================================
// GENERATE
// ============================================================

const USERS_TOTAL = NAMES.length;

function generateMockUsers(): IUserSummary[] {
    return Array.from({ length: USERS_TOTAL }, (_, index) => {
        const fullName = NAMES[index];
        const displayName = slugify(fullName);
        const role = pick(USER_ROLES, index, 23);

        return {
            id: `user-${pad(index + 1)}`,
            fullName,
            displayName,
            avatarUrl: `https://i.pravatar.cc/150?u=${displayName}`,
            coverUrl: null,
            email: `${displayName}@example.com`,
            bio: pick(BIO, index, 11),
            occupation: OCCUPATION_BY_ROLE[role] ?? null,
            company: null,
            location: pick(LOCATIONS, index, 47),
            website: null,
            gender: pick(GENDERS, index, 59),
            skills: pickSkills(index, 3 + (hash(index, 71) % 3)),
            birthday: new Date(2000 + (index % 6), index % 12, ((index * 3) % 28) + 1).toISOString(),
            createdAt: new Date(2024, index % 12, ((index * 2) % 28) + 1).toISOString(),
            followersCount: 12 + ((index * 37) % 1800),
            followingCount: 5 + ((index * 13) % 400),
            isFollowing: hash(index, 137) % 4 === 0,
            stats: {
                projects: 1 + ((index * 5) % 24),
                likes: 20 + ((index * 29) % 2400),
            },
        };
    });
}

export const mockUsers: IUserSummary[] = generateMockUsers();

// ============================================================
// QUERIES
// ============================================================

export function getUserByDisplayName(displayName: string): IUserSummary | undefined {
    return mockUsers.find((u) => u.displayName === displayName);
}

/**
 * Flips follow state directly on the fixture, so the mock behaves like a
 * real backend with state: reloading the page keeps it for the server process's lifetime.
 */
export function setMockFollow(displayName: string, isFollowing: boolean): IUserSummary | undefined {
    const user = mockUsers.find((u) => u.displayName === displayName);
    if (!user || user.isFollowing === isFollowing) return user;

    user.isFollowing = isFollowing;
    user.followersCount += isFollowing ? 1 : -1;
    return user;
}

// ============================================================
// CURSOR PAGINATION
// Same convention as mock-data/projects.ts: cursor = id of the last item
// fetched, sent back by the client to get the next "page".
// ============================================================

export const USER_SORTS: { value: UserSort; label: string }[] = [
    { value: 'followers', label: 'Most followers' },
    { value: 'projects', label: 'Most projects' },
    { value: 'recent', label: 'Recently joined' },
    { value: 'name', label: 'Name A-Z' },
];

const SORTERS: Record<UserSort, (a: IUserSummary, b: IUserSummary) => number> = {
    followers: (a, b) => b.followersCount - a.followersCount,
    projects: (a, b) => (b.stats?.projects ?? 0) - (a.stats?.projects ?? 0),
    recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
    name: (a, b) => (a.fullName ?? a.displayName).localeCompare(b.fullName ?? b.displayName),
};

export function getUsersCursorPage({
    cursor = null,
    limit = 15,
    q = null,
    role = null,
    skill = null,
    sort = 'followers',
}: IUsersQueries = {}): IUsersCursorPage {
    let source = mockUsers;

    if (q) {
        const keyword = q.trim().toLowerCase();
        source = source.filter(
            (u) =>
                (u.fullName ?? '').toLowerCase().includes(keyword) ||
                u.displayName.toLowerCase().includes(keyword) ||
                (u.occupation ? OCCUPATION_LABELS[u.occupation] : '').toLowerCase().includes(keyword) ||
                u.skills.some((s) => s.toLowerCase().includes(keyword)),
        );
    }

    if (role) {
        source = source.filter((u) => u.occupation === OCCUPATION_BY_ROLE[role]);
    }

    if (skill) {
        source = source.filter((u) => u.skills.includes(skill));
    }

    // Sort before slicing, otherwise the cursor would point at the wrong item
    source = [...source].sort(SORTERS[sort ?? 'followers']);

    const startIndex = cursor ? source.findIndex((u) => u.id === cursor) + 1 : 0;

    // cursor not found in the data set (filtered out / deleted) -> return empty, avoid a loop
    if (cursor && startIndex === 0) {
        return { items: [], nextCursor: null, hasMore: false, total: source.length };
    }

    const items = source.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + limit;
    const hasMore = nextIndex < source.length;
    const nextCursor = hasMore ? source[nextIndex - 1].id : null;

    return { items, nextCursor, hasMore, total: source.length };
}

/** Simulates an async API call (with network delay) for client-side cursor pagination */
export async function fetchUsersCursorPage(queries: IUsersQueries = {}, delayMs = 600): Promise<IUsersCursorPage> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return getUsersCursorPage(queries);
}

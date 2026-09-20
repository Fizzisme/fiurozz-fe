// ============================================================
// MOCK MEMBERS
// Fixture cho trang /members khi backend chưa có endpoint list user.
// Shape bám theo các trường mà components/ui/home/memberCard.tsx đang
// hiển thị, để sau này tái dùng card đó không phải đổi kiểu dữ liệu.
// ============================================================

export interface MemberStats {
    projects: number;
    followers: number;
    following: number;
    likes: number;
}

export interface Member {
    id: string;
    name: string;
    username: string;
    avatar: string;
    email: string;
    /** Câu slogan ngắn hiện dưới tên */
    headline: string;
    /** Nghề / vai trò, hiển thị cạnh icon School */
    role: string;
    location: string;
    /** ISO date - hiển thị cạnh icon Cake */
    birthday: string;
    skills: string[];
    stats: MemberStats;
    /** Người đang xem có theo dõi member này không (BE trả theo từng viewer) */
    isFollowing: boolean;
    /** ISO date - ngày tham gia Fiurozz */
    joinedAt: string;
}

// ============================================================
// NGUỒN SINH DỮ LIỆU
// ============================================================

const NAMES = [
    'Tuan Phi', 'Van Thai', 'Minh Anh', 'Ngoc Han', 'Quoc Bao', 'Thu Trang',
    'Hoang Long', 'Bao Chau', 'Duy Khang', 'Kim Ngan', 'Gia Huy', 'Thanh Tam',
    'Tien Dat', 'Phuong Uyen', 'Nhat Minh', 'Khanh Linh', 'Trung Kien', 'My Duyen',
    'Hai Dang', 'Tuong Vi', 'Anh Tuan', 'Le Vy', 'Dang Khoa', 'Thuy Tien',
    'Quang Vinh', 'Hong Nhung', 'Xuan Bach', 'Cam Tu', 'Huu Phuoc', 'Dieu Linh',
    'Tan Loc', 'Mai Chi', 'Nguyen Vu', 'Hoai Thuong', 'Dinh Nam', 'Thao Nguyen',
    'Viet Hung', 'Bich Ngoc', 'Cong Danh', 'Yen Nhi', 'Truong Son', 'Kieu Trang',
    'Ba Duy', 'Lan Huong', 'The Anh', 'Tuyet Mai', 'Sy Nguyen', 'Ha Vy',
];

export const MEMBER_ROLES = [
    'Student', 'Frontend Developer', 'Backend Developer', 'Fullstack Developer',
    'UI/UX Designer', 'Mobile Developer', 'DevOps Engineer', 'Data Engineer',
];

const LOCATIONS = [
    'Pleiku', 'Ha Noi', 'Da Nang', 'Ho Chi Minh City',
    'Can Tho', 'Hue', 'Nha Trang', 'Hai Phong',
];

const HEADLINES = [
    'Building things that load fast.',
    'Shipping small, shipping often.',
    'I care about the details nobody notices.',
    'Turning coffee into components.',
    'Learning in public.',
    'Design first, then code.',
    'Making the web feel lighter.',
    'Side projects are my main hobby.',
];

export const MEMBER_SKILLS = [
    'React', 'Next.js', 'TypeScript', 'Node.js', 'NestJS', 'Spring Boot',
    'PostgreSQL', 'MongoDB', 'Tailwind CSS', 'GSAP', 'Docker', 'Figma',
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
 * Băm số nguyên -> số nguyên, xác định và không tuyến tính.
 * Cần thiết vì `index * k % n` khoá các trường vào nhau: mọi member cùng role
 * sẽ nhận trùng headline và location, khiến trang trông như hỏng dữ liệu.
 */
function hash(seed: number, salt: number): number {
    let x = Math.imul(seed + salt * 0x9e37, 0x85eb) ^ 0x27d4;
    x = Math.imul(x ^ (x >>> 15), 0xc2b2);
    x ^= x >>> 13;
    return Math.abs(x);
}

/** Pseudo-random nhưng xác định (deterministic) dựa trên seed số nguyên */
function pick<T>(arr: T[], seed: number, salt = 0): T {
    return arr[hash(seed, salt) % arr.length];
}

function pad(num: number, size = 3): string {
    return num.toString().padStart(size, '0');
}

/** Lấy n skill khác nhau từ SKILL_POOL, vẫn deterministic theo seed */
function pickSkills(seed: number, count: number): string[] {
    const skills: string[] = [];
    for (let i = 0; skills.length < count && i < MEMBER_SKILLS.length * 2; i += 1) {
        const skill = MEMBER_SKILLS[hash(seed, 90 + i) % MEMBER_SKILLS.length];
        if (!skills.includes(skill)) skills.push(skill);
    }
    return skills;
}

// ============================================================
// GENERATE
// ============================================================

const MEMBERS_TOTAL = NAMES.length;

function generateMockMembers(): Member[] {
    return Array.from({ length: MEMBERS_TOTAL }, (_, index) => {
        const name = NAMES[index];
        const username = slugify(name);

        return {
            id: `member-${pad(index + 1)}`,
            name,
            username,
            avatar: `https://i.pravatar.cc/150?u=${username}`,
            email: `${username}@example.com`,
            headline: pick(HEADLINES, index, 11),
            role: pick(MEMBER_ROLES, index, 23),
            location: pick(LOCATIONS, index, 47),
            birthday: new Date(2000 + (index % 6), index % 12, ((index * 3) % 28) + 1).toISOString(),
            skills: pickSkills(index, 3 + (hash(index, 71) % 3)),
            isFollowing: hash(index, 137) % 4 === 0,
            stats: {
                projects: 1 + ((index * 5) % 24),
                followers: 12 + ((index * 37) % 1800),
                following: 5 + ((index * 13) % 400),
                likes: 20 + ((index * 29) % 2400),
            },
            joinedAt: new Date(2024, index % 12, ((index * 2) % 28) + 1).toISOString(),
        };
    });
}

export const mockMembers: Member[] = generateMockMembers();

// ============================================================
// TRUY VẤN
// ============================================================

export function getMemberByUsername(username: string): Member | undefined {
    return mockMembers.find((m) => m.username === username);
}

/**
 * Đổi trạng thái follow ngay trên fixture, để mock cư xử như một BE có state
 * thật: tải lại trang vẫn giữ nguyên trong vòng đời của server process.
 */
export function setMockFollow(username: string, isFollowing: boolean): Member | undefined {
    const member = mockMembers.find((m) => m.username === username);
    if (!member || member.isFollowing === isFollowing) return member;

    member.isFollowing = isFollowing;
    member.stats.followers += isFollowing ? 1 : -1;
    return member;
}

// ============================================================
// CURSOR PAGINATION
// Cùng quy ước với mock-data/projects.ts: cursor = id của item cuối
// cùng đã lấy, client gửi lại để lấy "trang" tiếp theo.
// ============================================================

export interface MembersCursorPage {
    items: Member[];
    nextCursor: string | null;
    hasMore: boolean;
    /** Tổng số member khớp bộ lọc hiện tại (không phải số item của trang này) */
    total: number;
}

/** Thứ tự sắp xếp danh sách member */
export type MemberSort = 'followers' | 'projects' | 'recent' | 'name';

export const MEMBER_SORTS: { value: MemberSort; label: string }[] = [
    { value: 'followers', label: 'Most followers' },
    { value: 'projects', label: 'Most projects' },
    { value: 'recent', label: 'Recently joined' },
    { value: 'name', label: 'Name A-Z' },
];

export interface GetMembersCursorParams {
    /** id của member cuối cùng đã load, null = lấy từ đầu */
    cursor?: string | null;
    /** số lượng item mỗi lần load */
    limit?: number;
    /** tìm theo tên / username / role / skill, null|undefined = không lọc */
    q?: string | null;
    /** lọc theo role, null|undefined = tất cả */
    role?: string | null;
    /** lọc theo skill, null|undefined = tất cả */
    skill?: string | null;
    /** thứ tự sắp xếp, mặc định 'followers' */
    sort?: MemberSort | null;
}

const SORTERS: Record<MemberSort, (a: Member, b: Member) => number> = {
    followers: (a, b) => b.stats.followers - a.stats.followers,
    projects: (a, b) => b.stats.projects - a.stats.projects,
    recent: (a, b) => b.joinedAt.localeCompare(a.joinedAt),
    name: (a, b) => a.name.localeCompare(b.name),
};

export function getMembersCursorPage({
    cursor = null,
    limit = 15,
    q = null,
    role = null,
    skill = null,
    sort = 'followers',
}: GetMembersCursorParams = {}): MembersCursorPage {
    let source = mockMembers;

    if (q) {
        const keyword = q.trim().toLowerCase();
        source = source.filter(
            (m) =>
                m.name.toLowerCase().includes(keyword) ||
                m.username.toLowerCase().includes(keyword) ||
                m.role.toLowerCase().includes(keyword) ||
                m.skills.some((s) => s.toLowerCase().includes(keyword)),
        );
    }

    if (role) {
        source = source.filter((m) => m.role === role);
    }

    if (skill) {
        source = source.filter((m) => m.skills.includes(skill));
    }

    // Sắp xếp trước khi cắt trang, nếu không cursor sẽ trỏ nhầm item
    source = [...source].sort(SORTERS[sort ?? 'followers']);

    const startIndex = cursor ? source.findIndex((m) => m.id === cursor) + 1 : 0;

    // cursor không tồn tại trong tập dữ liệu (đã bị lọc/xoá) -> trả rỗng, tránh loop
    if (cursor && startIndex === 0) {
        return { items: [], nextCursor: null, hasMore: false, total: source.length };
    }

    const items = source.slice(startIndex, startIndex + limit);
    const nextIndex = startIndex + limit;
    const hasMore = nextIndex < source.length;
    const nextCursor = hasMore ? source[nextIndex - 1].id : null;

    return { items, nextCursor, hasMore, total: source.length };
}

/** Giả lập gọi API bất đồng bộ (có độ trễ mạng) cho cursor pagination phía client */
export async function fetchMembersCursorPage(
    params: GetMembersCursorParams = {},
    delayMs = 600,
): Promise<MembersCursorPage> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return getMembersCursorPage(params);
}

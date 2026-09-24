// ============================================================
// MOCK MESSAGES
// Fixture cho dock nhắn tin khi backend chưa có endpoint. Hội thoại gắn
// vào mockUsers để avatar và tên khớp với trang /members.
// ============================================================

import { mockUsers, OCCUPATION_LABELS } from '@/mock-data/users';
import { type IUserSummary } from '@/types/user';

export interface DirectMessage {
    id: string;
    conversationId: string;
    /** 'me' = người đang đăng nhập, 'them' = user bên kia */
    from: 'me' | 'them';
    text: string;
    /** ISO date */
    sentAt: string;
}

export interface Conversation {
    /** Trùng displayName của user -> địa chỉ ổn định, không cần id riêng */
    id: string;
    displayName: string;
    fullName: string;
    avatar: string;
    role: string;
    lastMessage: string;
    lastAt: string;
    unread: number;
}

// ============================================================
// NGUỒN SINH DỮ LIỆU
// ============================================================

const THREADS: string[][] = [
    [
        'Hey — just read through your project listing. How long did the editor take you?',
        'About three weekends. The tree view was the part that fought back.',
        'Figured. Did you virtualise it or just cap the depth?',
    ],
    [
        'Your card layout is doing the thing I keep failing at. Any writeup?',
        'No writeup yet, but the whole thing is one grid and a lot of restraint.',
    ],
    [
        'Are you open to collaborating on something small this month?',
        'Depends on the scope — send it over and I will take a look tonight.',
        'Will do. Nothing heavy, maybe a weekend build.',
        'That I can do.',
    ],
    ['Nice work on the landing page. The scroll pinning is very clean.'],
    [
        'Quick one: which hosting are you on for the demo?',
        'Vercel free tier. It has held up fine so far.',
    ],
];

const HOURS_AGO = [1, 5, 26, 51, 120, 190];

/** Băm xác định, cùng ý đồ với mock-data/users.ts */
function hash(seed: number, salt: number): number {
    let x = Math.imul(seed + salt * 0x9e37, 0x85eb) ^ 0x27d4;
    x = Math.imul(x ^ (x >>> 15), 0xc2b2);
    x ^= x >>> 13;
    return Math.abs(x);
}

/** Mốc thời gian cố định để fixture không đổi giữa các lần render */
const EPOCH = new Date('2026-09-11T09:00:00.000Z').getTime();

function minutesBefore(minutes: number): string {
    return new Date(EPOCH - minutes * 60_000).toISOString();
}

// ============================================================
// STATE
// Giữ trong module để mock cư xử như một BE có state thật: gửi tin rồi
// mở lại dock vẫn thấy, trong vòng đời của server process.
// ============================================================

const CONVERSATION_COUNT = 6;

const messagesByConversation = new Map<string, DirectMessage[]>();
const conversations: Conversation[] = [];

function seed() {
    for (let i = 0; i < CONVERSATION_COUNT; i += 1) {
        const user = mockUsers[hash(i, 17) % mockUsers.length];
        if (conversations.some((c) => c.id === user.displayName)) continue;

        const thread = THREADS[i % THREADS.length];
        const startedAt = HOURS_AGO[i % HOURS_AGO.length] * 60;

        const items: DirectMessage[] = thread.map((text, index) => ({
            id: `${user.displayName}-${index}`,
            conversationId: user.displayName,
            // Tin đầu luôn từ họ; sau đó xen kẽ
            from: index % 2 === 0 ? 'them' : 'me',
            text,
            sentAt: minutesBefore(startedAt - index * 7),
        }));

        messagesByConversation.set(user.displayName, items);

        const last = items[items.length - 1];
        conversations.push({
            id: user.displayName,
            displayName: user.displayName,
            fullName: user.fullName ?? user.displayName,
            avatar: user.avatarUrl ?? '',
            role: user.occupation ? OCCUPATION_LABELS[user.occupation] : '',
            lastMessage: last.text,
            lastAt: last.sentAt,
            unread: last.from === 'them' && i % 3 === 0 ? 1 + (hash(i, 31) % 3) : 0,
        });
    }
}

seed();

function sortByRecency(list: Conversation[]): Conversation[] {
    return [...list].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}

// ============================================================
// TRUY VẤN
// ============================================================

export function getMockConversations(): Conversation[] {
    return sortByRecency(conversations);
}

export function getMockMessages(conversationId: string): DirectMessage[] {
    return messagesByConversation.get(conversationId) ?? [];
}

function userOf(displayName: string): IUserSummary | undefined {
    return mockUsers.find((u) => u.displayName === displayName);
}

/**
 * Mở hội thoại với một user. Chưa từng nhắn thì tạo một hội thoại rỗng
 * thay vì trả về không có gì — dock cần một đối tượng để dựng cửa sổ.
 */
export function ensureMockConversation(displayName: string): Conversation | null {
    const existing = conversations.find((c) => c.id === displayName);
    if (existing) return existing;

    const user = userOf(displayName);
    if (!user) return null;

    const created: Conversation = {
        id: user.displayName,
        displayName: user.displayName,
        fullName: user.fullName ?? user.displayName,
        avatar: user.avatarUrl ?? '',
        role: user.occupation ? OCCUPATION_LABELS[user.occupation] : '',
        lastMessage: '',
        lastAt: new Date(EPOCH).toISOString(),
        unread: 0,
    };

    conversations.push(created);
    messagesByConversation.set(user.displayName, []);
    return created;
}

export function appendMockMessage(conversationId: string, text: string): DirectMessage | null {
    const conversation = ensureMockConversation(conversationId);
    if (!conversation) return null;

    const items = messagesByConversation.get(conversationId) ?? [];
    const message: DirectMessage = {
        id: `${conversationId}-${items.length}-${Date.now()}`,
        conversationId,
        from: 'me',
        text,
        sentAt: new Date().toISOString(),
    };

    items.push(message);
    messagesByConversation.set(conversationId, items);

    conversation.lastMessage = text;
    conversation.lastAt = message.sentAt;
    conversation.unread = 0;

    return message;
}

export function markMockRead(conversationId: string): void {
    const conversation = conversations.find((c) => c.id === conversationId);
    if (conversation) conversation.unread = 0;
}

/** Giả lập độ trễ mạng, cùng quy ước với các fixture khác */
export async function fetchMockConversations(delayMs = 400): Promise<Conversation[]> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return getMockConversations();
}

export async function fetchMockMessages(conversationId: string, delayMs = 400): Promise<DirectMessage[]> {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return getMockMessages(conversationId);
}

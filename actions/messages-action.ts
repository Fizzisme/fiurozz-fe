'use server';

import { gatewayClient, ApiError } from '@/services/gateway-client';
import {
    appendMockMessage,
    ensureMockConversation,
    fetchMockConversations,
    fetchMockMessages,
    markMockRead,
    type Conversation,
    type DirectMessage,
} from '@/mock-data/messages';

export async function getConversationsAction(): Promise<Conversation[]> {
    try {
        // TODO: real url
        const envelope = await gatewayClient.get<Conversation[]>('/conversations');
        if (envelope.data) return envelope.data;
    } catch (error) {
        if (error instanceof ApiError && error.payload) {
            const envelope = error.payload as { data?: Conversation[] };
            if (envelope.data) return envelope.data;
        }
    }

    // MockData
    return fetchMockConversations();
}

export async function getMessagesAction(conversationId: string): Promise<DirectMessage[]> {
    try {
        // TODO: real url
        const envelope = await gatewayClient.get<DirectMessage[]>(`/conversations/${conversationId}/messages`);
        if (envelope.data) return envelope.data;
    } catch (error) {
        if (error instanceof ApiError && error.payload) {
            const envelope = error.payload as { data?: DirectMessage[] };
            if (envelope.data) return envelope.data;
        }
    }

    // MockData
    return fetchMockMessages(conversationId);
}

/**
 * Mở (hoặc tạo) hội thoại với một user. Dock gọi hàm này khi người dùng
 * bấm Message trên một người chưa từng nhắn.
 */
export async function openConversationAction(displayName: string): Promise<Conversation | null> {
    try {
        // TODO: real url
        const envelope = await gatewayClient.post<Conversation>('/conversations', { displayName });
        if (envelope.data) return envelope.data;
    } catch (error) {
        if (error instanceof ApiError && error.payload) {
            const envelope = error.payload as { data?: Conversation };
            if (envelope.data) return envelope.data;
        }
    }

    // MockData
    return ensureMockConversation(displayName);
}

export async function sendMessageAction(conversationId: string, text: string): Promise<DirectMessage | null> {
    try {
        // TODO: real url
        const envelope = await gatewayClient.post<DirectMessage>(
            `/conversations/${conversationId}/messages`,
            { text },
        );
        if (envelope.data) return envelope.data;
    } catch (error) {
        if (error instanceof ApiError && error.payload) {
            const envelope = error.payload as { data?: DirectMessage };
            if (envelope.data) return envelope.data;
        }
    }

    // MockData
    return appendMockMessage(conversationId, text);
}

export async function markConversationReadAction(conversationId: string): Promise<void> {
    try {
        // TODO: real url
        await gatewayClient.post(`/conversations/${conversationId}/read`);
        return;
    } catch {
        // MockData
        markMockRead(conversationId);
    }
}

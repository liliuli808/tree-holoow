import { api } from './api';

export interface Message {
    id: number;
    created_at: string;
    sender_id: number;
    receiver_id: number;
    content: string;
    read_at: string | null;
    sender?: {
        id: number;
        nickname: string;
        avatar_url: string;
    };
    receiver?: {
        id: number;
        nickname: string;
        avatar_url: string;
    };
}

export interface ConversationUser {
    id: number;
    nickname: string;
    avatar_url: string;
}

export interface Conversation {
    id: number;
    other_user: ConversationUser;
    last_message: string;
    last_message_at: number;
    unread_count: number;
}

// Get all conversations for the current user
export const getConversations = async (): Promise<Conversation[]> => {
    const response = await api('/chat/conversations');
    return response.data || [];
};

// Get messages with a specific user
export const getMessages = async (userId: number, page = 1, pageSize = 50): Promise<Message[]> => {
    const response = await api(`/chat/messages/${userId}?page=${page}&pageSize=${pageSize}`);
    return response.data || [];
};

// Send a message to a user (REST fallback)
export const sendMessage = async (receiverId: number, content: string): Promise<Message> => {
    const response = await api('/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiver_id: receiverId, content }),
    });
    return response.data;
};

// Mark a message as read
export const markAsRead = async (messageId: number): Promise<void> => {
    await api(`/chat/messages/${messageId}/read`, { method: 'PUT' });
};

// Get total unread message count
export const getUnreadCount = async (): Promise<number> => {
    const response = await api('/chat/unread-count');
    return response.count || 0;
};

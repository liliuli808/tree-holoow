import { api } from './api';

// Toggle like on a post
export const toggleLike = async (postId: string): Promise<{ liked: boolean; count: number }> => {
    return api(`/posts/${postId}/like`, {
        method: 'POST',
    });
};

// Get like status for a post
export const getLikeStatus = async (postId: string): Promise<{ liked: boolean; count: number }> => {
    return api(`/posts/${postId}/like/status`, {
        method: 'GET',
    });
};

// Comment interface
export interface Comment {
    ID: number;
    CreatedAt: string;
    user_id: number;
    user: {
        ID: number;
        email: string;
    };
    post_id: number;
    content: string;
}

interface CommentsResponse {
    data: Comment[];
    total: number;
    page: number;
}

// Get comments for a post
export const getComments = async (postId: string, page: number = 1, pageSize: number = 20): Promise<CommentsResponse> => {
    return api(`/posts/${postId}/comments?page=${page}&pageSize=${pageSize}`, {
        method: 'GET',
    });
};

// Create a comment
export const createComment = async (postId: string, content: string): Promise<Comment> => {
    return api(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
};

// Delete a comment
export const deleteComment = async (commentId: number): Promise<void> => {
    return api(`/comments/${commentId}`, {
        method: 'DELETE',
    });
};

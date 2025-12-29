// Post service - adapted for React Native with image picker support
import { api } from './api';
import { MEDIA_BASE_URL } from '../constants/config';
import * as SecureStore from 'expo-secure-store';

const PAGE_SIZE = 10;

export interface PaginatedPostsResponse {
    data: any[];
    total: number;
    page: number;
}

/**
 * Fetches a paginated list of posts from all users.
 */
export const getAllPosts = async (
    page: number,
    tagId?: number
): Promise<PaginatedPostsResponse> => {
    let url = `/posts?page=${page}&pageSize=${PAGE_SIZE}`;

    if (tagId !== undefined) {
        url += `&tag_id=${tagId}`;
    }

    return api(url, {
        method: 'GET',
    });
};

/**
 * Fetches a single post by ID.
 */
export const getPostById = async (postId: string): Promise<any> => {
    return api(`/posts/${postId}`, {
        method: 'GET',
    });
};

/**
 * Fetches a paginated list of posts for a specific user.
 */
export const getPostsForUser = async (
    userId: string,
    page: number,
    tagId?: number
): Promise<PaginatedPostsResponse> => {
    let url = `/users/${userId}/posts?page=${page}&pageSize=${PAGE_SIZE}`;

    if (tagId !== undefined) {
        url += `&tag_id=${tagId}`;
    }

    return api(url, {
        method: 'GET',
    });
};

/**
 * Uploads a file to the server - adapted for React Native.
 * @param uri The local file URI from image picker.
 * @param fileName The file name.
 * @param mimeType The MIME type of the file.
 */
export const uploadFile = async (
    uri: string,
    fileName: string,
    mimeType: string
): Promise<{ src: string }[]> => {
    const formData = new FormData();

    // React Native uses a different format for FormData files
    formData.append('file', {
        uri,
        name: fileName,
        type: mimeType,
    } as any);

    const response = await fetch(`${MEDIA_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'File upload failed');
    }

    return response.json();
};

interface CreatePostPayload {
    user_id: number;
    text_content: string;
    images?: string[];
    video?: string;
    audio?: string;
    cover?: string;
    tag_id?: number;
    status: 'draft' | 'published';
}

/**
 * Creates a new post.
 */
export const createPost = async (postData: CreatePostPayload): Promise<any> => {
    return api('/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
    });
};

import { api } from './api';
import { Post, User } from '../types';

const PAGE_SIZE = 10;

export const API_BASE_URL = 'https://51a26750.telegraph-image-8n3.pages.dev';

// This interface should match the backend's JSON structure for paginated results
export interface PaginatedPostsResponse {
  data: any[]; // Use any[] here because App.tsx handles the specific BackendPost mapping
  total: number;
  page: number;
}

/**
 * Fetches a paginated list of posts from all users.
 * @param page Page number
 * @param tagId Optional tag ID to filter posts by tag
 */
export const getAllPosts = async (
  page: number,
  tagId?: number
): Promise<PaginatedPostsResponse> => {
  let url = `/posts?page=${page}&pageSize=${PAGE_SIZE}`;

  // 如果提供了 tagId，添加到查询参数
  if (tagId !== undefined) {
    url += `&tag_id=${tagId}`;
  }

  return api(url, {
    method: 'GET',
  });
};

/**
 * Fetches a paginated list of posts for a specific user.
 * @param userId The user ID
 * @param page Page number
 * @param tagId Optional tag ID to filter posts by tag
 */
export const getPostsForUser = async (
  userId: string,
  page: number,
  tagId?: number
): Promise<PaginatedPostsResponse> => {
  let url = `/users/${userId}/posts?page=${page}&pageSize=${PAGE_SIZE}`;

  // 如果提供了 tagId，添加到查询参数
  if (tagId !== undefined) {
    url += `&tag_id=${tagId}`;
  }

  return api(url, {
    method: 'GET',
  });
};

/**
 * Uploads a file to the server.
 * @param file The file to upload.
 * @returns The path to the uploaded file on the server.
 */
export const uploadFile = async (file: File): Promise<{ src: string }[]> => {
  const formData = new FormData();
  formData.append('file', file);

  // The 'api' wrapper defaults to JSON, so we need to override headers for FormData.
  // We remove Content-Type and let the browser set it correctly with the boundary.
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'File upload failed');
  }

  return response.json();
};

// The backend CreatePostDto expects separate fields for different media types
interface CreatePostPayload {
  user_id: number;
  text_content: string;
  images?: string[];
  video?: string;
  audio?: string;
  cover?: string;
  tag_id?: number;  // Single tag ID for one-to-one relationship
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

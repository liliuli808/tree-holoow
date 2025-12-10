import { api } from './api';
import { Post, User } from '../types';

const PAGE_SIZE = 10;

export const API_BASE_URL = 'https://51a26750.telegraph-image-8n3.pages.dev';

interface PaginatedPostsResponse {
  data: Post[];
  total: number;
  page: number;
}

/**
 * Fetches a paginated list of posts for a specific user.
 */
export const getPostsForUser = async (userId: string, page: number): Promise<PaginatedPostsResponse> => {
  return api(`/users/${userId}/posts?page=${page}&pageSize=${PAGE_SIZE}`, {
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

// The backend CreatePostDto expects tag names as an array of strings.
interface CreatePostPayload {
  user_id: number;
  type: string;
  text_content: string;
  media_urls?: string[];
  tags?: string[];
  status: 'draft' | 'published';
}

/**
 * Creates a new post.
 */
export const createPost = async (postData: CreatePostPayload): Promise<Post> => {
  return api('/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
};

import { api } from './api';
import { Post } from '../types';

export interface UserProfile {
    id: number;
    email: string;
    nickname: string;
    avatar_url: string;
    background_url: string;
    created_at: string;
    bio: string;
    location: string;
    birthday: string;
    age: number;
    constellation: string;
    follow_count: number;
    fan_count: number;
    liked_count: number;
    collected_count: number;
    posts: any[]; // Use any[] temporarily or map strictly. Ideally should match Post type or be adapted.
}

export interface UpdateProfileRequest {
    nickname?: string;
    avatar_url?: string;
    background_url?: string;
    bio?: string;
    location?: string;
    birthday?: string;
}

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<UserProfile> => {
    return api('/users/profile', {
        method: 'GET',
    });
};

/**
 * Update user profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfile> => {
    return api('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

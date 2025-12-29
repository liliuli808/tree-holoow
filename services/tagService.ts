// Tag service - same as original
import { api } from './api';

export interface Tag {
    ID: number;
    CreatedAt: string;
    UpdatedAt: string;
    DeletedAt: string | null;
    name: string;
}

/**
 * Fetches all available tags from the server.
 */
export const getAllTags = async (): Promise<Tag[]> => {
    return api('/tags', {
        method: 'GET',
    });
};

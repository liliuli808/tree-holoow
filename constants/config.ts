// API Configuration - same as the original Capacitor app
// Using local network IP for development
export const API_BASE_URL = 'http://127.0.0.1s:8080';

// Media CDN URL
export const MEDIA_BASE_URL = 'https://51a26750.telegraph-image-8n3.pages.dev';

// Get full media URL from path
export const getMediaUrl = (path: string | undefined | null): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${MEDIA_BASE_URL}.${path}`;
};

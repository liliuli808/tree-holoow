// Use local network IP for mobile devices, localhost for web development
const isMobile = typeof window !== 'undefined' &&
  (window.location.protocol === 'capacitor:' || window.location.protocol === 'ionic:');

export const API_BASE_URL = isMobile
  ? 'http://192.168.1.104:8080/api/v1'  // Your computer's local IP
  : 'http://localhost:8080/api/v1';

export const MEDIA_BASE_URL = 'https://51a26750.telegraph-image-8n3.pages.dev';

export const getMediaUrl = (path: string | undefined | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${MEDIA_BASE_URL}.${path}`;
};

// A wrapper for the native fetch API to streamline API calls.
export const api = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: 'An unknown error occurred.' };
    }
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  // If response has no content, return null, otherwise parse as JSON.
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json();
  }

  return null;
};

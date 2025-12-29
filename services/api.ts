// API service - adapted for React Native with SecureStore
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, MEDIA_BASE_URL, getMediaUrl } from '../constants/config';

export { getMediaUrl };

// A wrapper for the native fetch API to streamline API calls.
export const api = async (path: string, options: RequestInit = {}) => {
  const token = await SecureStore.getItemAsync('token');

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
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
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    return response.json();
  }

  return null;
};

// Auth service - same as original, no changes needed
import { api } from './api';

export const sendVerificationCode = async (email: string): Promise<void> => {
    await api('/email/send', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
};

export const login = async (email: string, password: string): Promise<string> => {
    const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (!data || !data.token) {
        throw new Error('Token not found in login response');
    }
    return data.token;
};

export const register = async (
    email: string,
    code: string,
    password: string
): Promise<{ id: string; email: string }> => {
    const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, code, password }),
    });

    if (!data || !data.user.id || !data.user.email) {
        throw new Error('User ID or email not found in register response');
    }
    return { id: data.user.id, email: data.user.email };
};

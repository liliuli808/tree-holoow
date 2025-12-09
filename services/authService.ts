// src/services/authService.ts
import { api } from './api'; // 1. 直接引入你写好的工具函数

export const sendVerificationCode = async (email: string): Promise<void> => {
  // 2. 不需要拼接 URL，也不需要手动判断 !response.ok，工具函数都做好了
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

export const register = async (username: string, email: string, code: string, password: string): Promise<{id: string, email: string}> => {
  const data = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, code, password }),
  });

  if (!data || !data.id || !data.email) {
    throw new Error('User ID or email not found in register response');
  }
  return { id: data.id, email: data.email };
};
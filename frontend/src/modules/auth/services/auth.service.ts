import { api, USE_MOCK } from '../../../services/api';
import { mockLogin } from '../../../services/mock/db';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const authService = {
  // POST /auth/login  -> { token, user }
  login: async (req: LoginRequest): Promise<LoginResponse> => {
    if (USE_MOCK) return mockLogin(req);
    const { data } = await api.post<LoginResponse>('/auth/login', req);
    return data;
  },
  // POST /auth/logout
  logout: async (): Promise<void> => {
    if (!USE_MOCK) await api.post('/auth/logout').catch(() => undefined);
  },
};

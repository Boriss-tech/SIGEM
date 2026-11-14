import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { request } from '../api/http';
import type { SessionUser } from './types';

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = sessionStorage.getItem('sigem-token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const current = await request<SessionUser>('/auth/me');
      setUser(current);
    } catch {
      sessionStorage.removeItem('sigem-token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
    const unauthorized = () => setUser(null);
    window.addEventListener('sigem:unauthorized', unauthorized);
    return () => window.removeEventListener('sigem:unauthorized', unauthorized);
  }, [loadSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await request<{ token: string; usuario: SessionUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    sessionStorage.setItem('sigem-token', result.token);
    setUser(result.usuario);
  }, []);

  const logout = useCallback(async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      sessionStorage.removeItem('sigem-token');
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
      can: (module, action) =>
        Boolean(user?.permisos.some((permission) => permission.modulo === module && permission.accion === action)),
    }),
    [user, loading, login, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}

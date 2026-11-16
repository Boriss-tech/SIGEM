import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../modules/auth/services/auth.service';
import type { AuthUser, LoginRequest, Permiso } from '../modules/auth/types/auth.types';

const KEY_USER = 'sigem_user';
const KEY_TOKEN = 'sigem_token';

interface AuthContextValue {
  user: AuthUser | null;
  login: (req: LoginRequest) => Promise<AuthUser>;
  logout: () => void;
  /** Solo oculta/muestra UI. La autorización real la valida el backend (RNF-15). */
  can: (permiso: Permiso) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // sessionStorage para que no se pierda al recargar en desarrollo.
  // El backend puede migrar a cookie httpOnly sin cambiar las pantallas.
  const [user, setUser] = useState<AuthUser | null>(() => {
    const s = sessionStorage.getItem(KEY_USER);
    return s ? (JSON.parse(s) as AuthUser) : null;
  });

  const logout = useCallback(() => {
    void authService.logout();
    sessionStorage.removeItem(KEY_USER);
    sessionStorage.removeItem(KEY_TOKEN);
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  const login = useCallback(async (req: LoginRequest) => {
    const res = await authService.login(req);
    sessionStorage.setItem(KEY_TOKEN, res.token);
    sessionStorage.setItem(KEY_USER, JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  }, []);

  const can = useCallback((p: Permiso) => !!user?.permisos.includes(p), [user]);
  const value = useMemo(() => ({ user, login, logout, can }), [user, login, logout, can]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

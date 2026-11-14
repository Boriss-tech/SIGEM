import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { useAuth } from './AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="loading-screen" role="status">Cargando tu sesión…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

export function RoleGuard({
  module,
  action = 'ver',
  children,
}: PropsWithChildren<{ module: string; action?: string }>) {
  const { can } = useAuth();
  return can(module, action) ? children : <Navigate to="/403" replace />;
}

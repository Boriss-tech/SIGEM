import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../modules/auth/hooks/useAuth';
import type { Permiso } from '../modules/auth/types/auth.types';

export default function ProtectedRoute({ permiso }: { permiso?: Permiso }) {
  const { user, can } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (permiso && !can(permiso)) return <Navigate to="/sin-acceso" replace />;
  return <Outlet />;
}

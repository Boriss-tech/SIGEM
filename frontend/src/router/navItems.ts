import type { Permiso, RolCodigo } from '../modules/auth/types/auth.types';

export interface NavItem { label: string; to: string; icon: string; permiso?: Permiso }

/** El Sidebar muestra solo los ítems cuyo permiso tiene el usuario (UX; el backend valida de verdad). */
export const navItems: NavItem[] = [
  { label: 'Panel', to: '/', icon: 'bi-speedometer2' },
  { label: 'Ventas', to: '/ventas', icon: 'bi-cart3', permiso: 'ventas:ver' },
  { label: 'Inventario', to: '/inventario', icon: 'bi-boxes', permiso: 'inventario:ver' },
  { label: 'Compras', to: '/compras', icon: 'bi-truck', permiso: 'compras:ver' },
  { label: 'Documentos y RCV', to: '/documentos', icon: 'bi-receipt', permiso: 'documentos:ver' },
  { label: 'Reportes', to: '/reportes', icon: 'bi-graph-up', permiso: 'reportes:ver' },
  { label: 'Administración', to: '/admin', icon: 'bi-gear', permiso: 'usuarios:ver' },
  { label: 'Alertas', to: '/alertas', icon: 'bi-bell' },
];

/** Pantalla de inicio después del login, según el rol. */
export const HOME_BY_ROLE: Record<RolCodigo, string> = {
  ADMIN: '/', ADMINISTRATIVO: '/', BODEGA: '/inventario', VENTAS: '/ventas', CONTADOR: '/documentos',
};

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { Role } from '../auth/types';

const navItems = [
  { to: '/', label: 'Panel', icon: 'bi-grid-1x2-fill', module: null },
  { to: '/ventas', label: 'Venta rápida', icon: 'bi-cart3', module: 'ventas' },
  { to: '/inventario', label: 'Inventario', icon: 'bi-box-seam', module: 'inventario' },
  { to: '/compras', label: 'Compras', icon: 'bi-bag-check', module: 'compras' },
  { to: '/proveedores', label: 'Proveedores', icon: 'bi-truck', module: 'compras' },
  { to: '/clientes', label: 'Clientes', icon: 'bi-person-vcard', module: 'ventas' },
  { to: '/documentos', label: 'Documentos', icon: 'bi-file-earmark-text', module: 'documentos' },
  { to: '/reportes', label: 'Reportes', icon: 'bi-bar-chart', module: 'reportes' },
  { to: '/usuarios', label: 'Usuarios', icon: 'bi-people', module: 'usuarios' },
  { to: '/parametros', label: 'Parámetros', icon: 'bi-sliders', module: 'parametros' },
];

const roleNames: Record<Role, string> = {
  ADMIN: 'Administrador',
  ADMINISTRATIVO: 'Administrativo',
  BODEGA: 'Bodega',
  VENTAS: 'Ventas',
  CONTADOR: 'Contador',
};

export function Layout() {
  const { user, can, logout } = useAuth();
  const navigate = useNavigate();

  const closeSession = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <NavLink className="brand" to="/" aria-label="SIGEM-Pyme, ir al panel">
          <span className="brand-mark"><i className="bi bi-shop-window" /></span>
          <span>SIGEM-Pyme</span>
        </NavLink>
        <div className="nav-caption">Gestión</div>
        <nav>
          {navItems
            .filter((item) => item.module === null || can(item.module, 'ver'))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}
                aria-label={item.label}
              >
                <i className={`bi ${item.icon}`} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-user">
          <div className="small fw-semibold">{user?.nombre}</div>
          <div className="small opacity-75">{user ? roleNames[user.rol] : ''}</div>
          <button type="button" className="btn btn-link text-white p-0 mt-2 small" onClick={() => void closeSession()}>
            <i className="bi bi-box-arrow-right me-2" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="main-area">
        <Outlet />
      </main>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { navItems } from '../../router/navItems';

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { can } = useAuth();
  return (
    <nav className="nav flex-column p-2" aria-label="Menú principal">
      {navItems.filter((i) => !i.permiso || can(i.permiso)).map((i) => (
        <NavLink key={i.to} to={i.to} end={i.to === '/'} onClick={onNavigate}
          className={({ isActive }) => `nav-link sidebar-link ${isActive ? 'active' : ''}`}>
          <i className={`bi ${i.icon} me-2`} aria-hidden="true" />{i.label}
        </NavLink>
      ))}
    </nav>
  );
}

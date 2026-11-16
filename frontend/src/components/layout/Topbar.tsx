import { Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { useAlerts } from '../../modules/alerts/hooks/useAlerts';

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const { data: alerts } = useAlerts();
  const pendientes = alerts?.filter((a) => !a.leida).length ?? 0;
  return (
    <header className="d-flex align-items-center gap-2 px-3 py-2 bg-white border-bottom">
      <Button variant="outline-secondary" size="sm" className="d-lg-none" onClick={onMenu} aria-label="Abrir menú">
        <i className="bi bi-list" />
      </Button>
      <strong>{user?.empresa}</strong>
      <div className="ms-auto d-flex align-items-center gap-2">
        <span className="text-muted d-none d-md-inline">{user?.nombre}</span>
        <Badge bg="primary">{user?.rolNombre}</Badge>
        <Link to="/alertas" className="btn btn-outline-secondary btn-sm position-relative" aria-label={`Alertas pendientes: ${pendientes}`}>
          <i className="bi bi-bell" />
          {pendientes > 0 && <Badge bg="danger" pill className="ms-1">{pendientes}</Badge>}
        </Link>
        <Button variant="outline-secondary" size="sm" onClick={logout}><i className="bi bi-box-arrow-right me-1" />Salir</Button>
      </div>
    </header>
  );
}

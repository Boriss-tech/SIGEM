import { Link } from 'react-router-dom';

export default function NoAccessPage() {
  return (
    <div className="text-center py-5">
      <div style={{ fontSize: 48 }}>🔒</div>
      <h1 className="h4">No tienes acceso a esta sección</h1>
      <p className="text-muted">Tu rol no tiene los permisos necesarios. Si crees que es un error, contacta al administrador.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  );
}

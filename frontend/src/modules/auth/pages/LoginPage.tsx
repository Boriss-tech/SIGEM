import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../services/api';
import { HOME_BY_ROLE } from '../../../router/navItems';
import { useAuth } from '../hooks/useAuth';
import LoginForm, { type LoginValues } from '../components/LoginForm';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to={HOME_BY_ROLE[user.rol]} replace />;

  const onSubmit = async (v: LoginValues) => {
    setError(null);
    try {
      const u = await login(v);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      navigate(from ?? HOME_BY_ROLE[u.rol], { replace: true });
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div className="login-bg">
      <Card style={{ width: '100%', maxWidth: 420 }} className="shadow">
        <Card.Body className="p-4">
          <div className="text-center mb-3">
            <div style={{ fontSize: 42 }}>🏪</div>
            <h1 className="h4 mb-0">{import.meta.env.VITE_APP_NAME}</h1>
            <small className="text-muted">Gestión integrada para tu minimarket</small>
          </div>
          <LoginForm onSubmit={onSubmit} error={error} />
        </Card.Body>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../services/api';
import { HOME_BY_ROLE } from '../../../router/navItems';
import { useAuth } from '../hooks/useAuth';
import LoginForm, { type LoginValues } from '../components/LoginForm';

const APP_NAME = import.meta.env.VITE_APP_NAME;

const FEATURES = [
  { icon: 'bi-boxes', title: 'Inventario en tiempo real', text: 'Stock, lotes y alertas de vencimiento' },
  { icon: 'bi-cart3', title: 'Ventas y compras', text: 'Venta rápida, cotizaciones, recepción y cuentas por cobrar y pagar' },
  { icon: 'bi-receipt', title: 'Respaldo tributario', text: 'Documentos electrónicos y conciliación con el RCV' },
];

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
    <div className="login-split">
      {/* Panel de marca: solo en pantallas grandes */}
      <aside className="login-brand d-none d-lg-flex">
        <div className="d-flex align-items-center gap-3">
          <div className="login-logo"><i className="bi bi-shop" aria-hidden="true" /></div>
          <span className="fs-4 fw-bold">{APP_NAME}</span>
        </div>

        <div>
          <h2 className="login-headline">Controla tu minimarket en un solo lugar</h2>
          {FEATURES.map((f) => (
            <div key={f.title} className="login-feature">
              <div className="login-feature-icon"><i className={`bi ${f.icon}`} aria-hidden="true" /></div>
              <div>
                <div className="fw-semibold fs-6">{f.title}</div>
                <div className="login-soft">{f.text}</div>
              </div>
            </div>
          ))}
        </div>

        <small className="login-soft">© {new Date().getFullYear()} {APP_NAME}</small>
      </aside>

      {/* Formulario */}
      <main className="login-form-side">
        <div className="login-form-wrap">
          <div className="d-flex d-lg-none align-items-center gap-2 mb-4">
            <div className="login-logo login-logo-dark"><i className="bi bi-shop" aria-hidden="true" /></div>
            <span className="fs-5 fw-bold">{APP_NAME}</span>
          </div>
          <h1 className="h2 fw-bold mb-1">Iniciar sesión</h1>
          <p className="text-muted mb-4">Ingresa con tu cuenta para continuar</p>
          <LoginForm onSubmit={onSubmit} error={error} />
        </div>
      </main>
    </div>
  );
}
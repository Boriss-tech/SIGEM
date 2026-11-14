import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, RoleGuard } from './auth/Guards';
import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ModulePage } from './pages/ModulePage';
import { MessagePage } from './pages/MessagePage';
import { CatalogPage } from './pages/CatalogPage';

const moduleRoutes = [
  { path: '/ventas', title: 'Venta rápida', module: 'ventas', icon: 'bi-cart3' },
  { path: '/compras', title: 'Compras', module: 'compras', icon: 'bi-bag-check' },
  { path: '/documentos', title: 'Documentos y RCV', module: 'documentos', icon: 'bi-file-earmark-text' },
  { path: '/reportes', title: 'Reportes', module: 'reportes', icon: 'bi-bar-chart' },
  { path: '/usuarios', title: 'Usuarios y permisos', module: 'usuarios', icon: 'bi-people' },
  { path: '/parametros', title: 'Parámetros', module: 'parametros', icon: 'bi-sliders' },
];

function LoginRoute() {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : <Login />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/inventario" element={<RoleGuard module="inventario"><CatalogPage kind="productos" /></RoleGuard>} />
          <Route path="/proveedores" element={<RoleGuard module="compras"><CatalogPage kind="proveedores" /></RoleGuard>} />
          <Route path="/clientes" element={<RoleGuard module="ventas"><CatalogPage kind="clientes" /></RoleGuard>} />
          {moduleRoutes.map(({ path, title, module, icon }) => (
            <Route
              key={path}
              path={path}
              element={
                <RoleGuard module={module}>
                  <ModulePage title={title} icon={icon} />
                </RoleGuard>
              }
            />
          ))}
          <Route path="/403" element={<MessagePage code="403" title="No autorizada" message="Tu rol no tiene permiso para ver este módulo." />} />
          <Route path="*" element={<MessagePage code="404" title="Página no encontrada" message="Vuelve al panel para continuar." />} />
        </Route>
      </Route>
    </Routes>
  );
}

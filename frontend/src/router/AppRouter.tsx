import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../modules/auth/pages/LoginPage';
import NoAccessPage from '../modules/auth/pages/NoAccessPage';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import SalesPage from '../modules/sales/pages/SalesPage';
import InventoryPage from '../modules/inventory/pages/InventoryPage';
import PurchasesPage from '../modules/purchases/pages/PurchasesPage';
import DocumentsPage from '../modules/documents/pages/DocumentsPage';
import ReportsPage from '../modules/reports/pages/ReportsPage';
import AdminPage from '../modules/admin/pages/AdminPage';
import AlertsPage from '../modules/alerts/pages/AlertsPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route element={<ProtectedRoute permiso="ventas:ver" />}><Route path="ventas" element={<SalesPage />} /></Route>
          <Route element={<ProtectedRoute permiso="inventario:ver" />}><Route path="inventario" element={<InventoryPage />} /></Route>
          <Route element={<ProtectedRoute permiso="compras:ver" />}><Route path="compras" element={<PurchasesPage />} /></Route>
          <Route element={<ProtectedRoute permiso="documentos:ver" />}><Route path="documentos" element={<DocumentsPage />} /></Route>
          <Route element={<ProtectedRoute permiso="reportes:ver" />}><Route path="reportes" element={<ReportsPage />} /></Route>
          <Route element={<ProtectedRoute permiso="usuarios:ver" />}><Route path="admin" element={<AdminPage />} /></Route>
          <Route path="alertas" element={<AlertsPage />} />
          <Route path="sin-acceso" element={<NoAccessPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

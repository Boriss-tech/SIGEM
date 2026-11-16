import { Tab, Tabs } from 'react-bootstrap';
import PageHeader from '../../../components/ui/PageHeader';
import { useAuth } from '../../auth/hooks/useAuth';
import AuditLog from '../components/AuditLog';
import ParametersForm from '../components/ParametersForm';
import RolesMatrix from '../components/RolesMatrix';
import UsersTable from '../components/UsersTable';

export default function AdminPage() {
  const { can } = useAuth();
  return (
    <>
      <PageHeader title="Administración" subtitle="Usuarios, roles, bitácora y parámetros de la empresa" />
      <Tabs defaultActiveKey="usuarios" className="mb-3">
        <Tab eventKey="usuarios" title="Usuarios"><UsersTable /></Tab>
        <Tab eventKey="roles" title="Roles y permisos"><RolesMatrix /></Tab>
        <Tab eventKey="bitacora" title="Bitácora"><AuditLog /></Tab>
        {can('parametros:ver') && <Tab eventKey="parametros" title="Parámetros"><ParametersForm /></Tab>}
      </Tabs>
    </>
  );
}

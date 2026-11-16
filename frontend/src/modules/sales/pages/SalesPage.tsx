import { Tab, Tabs } from 'react-bootstrap';
import PageHeader from '../../../components/ui/PageHeader';
import ReadOnlyNotice from '../../../components/ui/ReadOnlyNotice';
import { useAuth } from '../../auth/hooks/useAuth';
import PosForm from '../components/PosForm';
import QuotesTable from '../components/QuotesTable';
import ReceivablesTable from '../components/ReceivablesTable';

export default function SalesPage() {
  const { can } = useAuth();
  const puedeVender = can('ventas:crear');
  return (
    <>
      <PageHeader title="Ventas y clientes" subtitle="Venta rápida, cotizaciones y cuentas por cobrar" />
      {!puedeVender && <ReadOnlyNotice />}
      <Tabs defaultActiveKey={puedeVender ? 'pos' : 'cotizaciones'} className="mb-3">
        {puedeVender && <Tab eventKey="pos" title="Nueva venta"><PosForm /></Tab>}
        <Tab eventKey="cotizaciones" title="Cotizaciones"><QuotesTable /></Tab>
        <Tab eventKey="cobrar" title="Por cobrar"><ReceivablesTable /></Tab>
      </Tabs>
    </>
  );
}

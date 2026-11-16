import { Tab, Tabs } from 'react-bootstrap';
import PageHeader from '../../../components/ui/PageHeader';
import ReadOnlyNotice from '../../../components/ui/ReadOnlyNotice';
import { useAuth } from '../../auth/hooks/useAuth';
import KardexTable from '../components/KardexTable';
import ProductTable from '../components/ProductTable';
import StockCount from '../components/StockCount';

export default function InventoryPage() {
  const { can } = useAuth();
  return (
    <>
      <PageHeader title="Inventario y bodegas" subtitle="Productos, kardex y conteos físicos" />
      {!can('inventario:editar') && <ReadOnlyNotice />}
      <Tabs defaultActiveKey="productos" className="mb-3">
        <Tab eventKey="productos" title="Productos"><ProductTable /></Tab>
        <Tab eventKey="kardex" title="Kardex"><KardexTable /></Tab>
        <Tab eventKey="conteo" title="Conteo físico"><StockCount /></Tab>
      </Tabs>
    </>
  );
}

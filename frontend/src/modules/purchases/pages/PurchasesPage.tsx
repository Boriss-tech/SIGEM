import { Tab, Tabs } from 'react-bootstrap';
import PageHeader from '../../../components/ui/PageHeader';
import PayablesTable from '../components/PayablesTable';
import PurchaseOrders from '../components/PurchaseOrders';
import Reception from '../components/Reception';

export default function PurchasesPage() {
  return (
    <>
      <PageHeader title="Compras y proveedores" subtitle="Órdenes de compra, recepción y cuentas por pagar" />
      <Tabs defaultActiveKey="ordenes" className="mb-3">
        <Tab eventKey="ordenes" title="Órdenes de compra"><PurchaseOrders /></Tab>
        <Tab eventKey="recepcion" title="Recepción"><Reception /></Tab>
        <Tab eventKey="pagar" title="Por pagar"><PayablesTable /></Tab>
      </Tabs>
    </>
  );
}

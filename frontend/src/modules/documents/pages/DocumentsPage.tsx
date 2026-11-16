import { Tab, Tabs } from 'react-bootstrap';
import PageHeader from '../../../components/ui/PageHeader';
import { useAuth } from '../../auth/hooks/useAuth';
import DocumentRepository from '../components/DocumentRepository';
import ImportWizard from '../components/ImportWizard';
import Reconciliation from '../components/Reconciliation';

export default function DocumentsPage() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Documentos tributarios y RCV" subtitle="Repositorio, importación de XML/RCV y conciliación" />
      <Tabs defaultActiveKey={user?.rol === 'CONTADOR' ? 'conciliacion' : 'repositorio'} className="mb-3">
        <Tab eventKey="repositorio" title="Repositorio"><DocumentRepository /></Tab>
        <Tab eventKey="importar" title="Importar"><ImportWizard /></Tab>
        <Tab eventKey="conciliacion" title="Conciliación RCV"><Reconciliation /></Tab>
      </Tabs>
    </>
  );
}

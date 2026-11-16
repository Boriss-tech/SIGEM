import { Button } from 'react-bootstrap';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatCLP } from '../../../utils/formatCLP';
import { formatDate } from '../../../utils/formatDate';
import { downloadBlob } from '../../../utils/downloadBlob';
import { useDocumentos } from '../hooks/useDocuments';
import { documentsService } from '../services/documents.service';

export default function DocumentRepository() {
  const { data, isLoading } = useDocumentos();
  return (
    <DataTable searchable loading={isLoading} data={data} rowKey={(d) => d.id} columns={[
      { header: 'Tipo', cell: (d) => d.tipo },
      { header: 'Folio', cell: (d) => d.folio },
      { header: 'Contraparte', cell: (d) => d.contraparte },
      { header: 'Emisión', cell: (d) => formatDate(d.fecha) },
      { header: 'Total', cell: (d) => formatCLP(d.total) },
      { header: 'Estado', cell: (d) => <StatusBadge value={d.estado} /> },
      { header: '', cell: (d) => (
        <Button size="sm" variant="outline-secondary" onClick={async () => downloadBlob(await documentsService.descargarXml(d.id), `${d.folio}.xml`)}>
          <i className="bi bi-download me-1" />XML
        </Button>) },
    ]} />
  );
}

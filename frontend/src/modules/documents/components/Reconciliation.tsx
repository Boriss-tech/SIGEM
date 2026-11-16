import { useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import DataTable from '../../../components/ui/DataTable';
import KpiCard from '../../../components/ui/KpiCard';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useToast } from '../../../context/ToastContext';
import { formatCLP } from '../../../utils/formatCLP';
import { useAuth } from '../../auth/hooks/useAuth';
import { useConciliacion } from '../hooks/useDocuments';
import type { RcvRegistro } from '../types/documents.types';

export default function Reconciliation() {
  const { can } = useAuth();
  const toast = useToast();
  const [periodo, setPeriodo] = useState('2026-10');
  const { data, isLoading } = useConciliacion(periodo);
  const [sel, setSel] = useState<RcvRegistro | null>(null);
  const r = data?.resumen;
  return (
    <>
      <Form.Group className="mb-3" style={{ maxWidth: 220 }}>
        <Form.Label htmlFor="per">Período</Form.Label>
        <Form.Control id="per" type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} />
      </Form.Group>
      {r && (
        <Row className="g-3 mb-3">
          <Col sm={6} xl={3}><KpiCard label="Conciliados" value={String(r.conciliados)} icon="bi-check2-circle" variant="success" /></Col>
          <Col sm={6} xl={3}><KpiCard label="Diferencia de monto" value={String(r.diferencia)} icon="bi-exclamation-circle" variant="warning" /></Col>
          <Col sm={6} xl={3}><KpiCard label="Sin documento" value={String(r.sinDocumento)} icon="bi-file-earmark-x" variant="danger" /></Col>
          <Col sm={6} xl={3}><KpiCard label="Pendientes" value={String(r.pendientes)} icon="bi-hourglass-split" /></Col>
        </Row>
      )}
      <DataTable loading={isLoading} data={data?.registros} rowKey={(x) => x.id} columns={[
        { header: 'Libro', cell: (x) => x.libro }, { header: 'Tipo', cell: (x) => x.tipo }, { header: 'Folio', cell: (x) => x.folio },
        { header: 'Contraparte', cell: (x) => x.contraparte }, { header: 'Monto RCV', cell: (x) => formatCLP(x.monto) },
        { header: 'Estado', cell: (x) => <StatusBadge value={x.estado} /> },
        { header: '', cell: (x) => x.detalle ? <Button size="sm" variant="outline-secondary" onClick={() => setSel(x)}>Ver detalle</Button> : null },
      ]} />
      {can('documentos:ver') && <Button className="mt-3" onClick={() => toast('Exportando para el contador…', 'info')}><i className="bi bi-file-earmark-excel me-1" />Exportar para el contador</Button>}
      <Modal show={!!sel} onHide={() => setSel(null)} centered>
        <Modal.Header closeButton><Modal.Title className="h6">Folio {sel?.folio} · {sel?.contraparte}</Modal.Title></Modal.Header>
        <Modal.Body>{sel?.detalle}</Modal.Body>
      </Modal>
    </>
  );
}

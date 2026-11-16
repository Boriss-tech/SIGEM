import { useRef, useState } from 'react';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { useMutation } from '@tanstack/react-query';
import DataTable from '../../../components/ui/DataTable';
import KpiCard from '../../../components/ui/KpiCard';
import ReadOnlyNotice from '../../../components/ui/ReadOnlyNotice';
import StatusBadge from '../../../components/ui/StatusBadge';
import { getErrorMessage } from '../../../services/api';
import { useAuth } from '../../auth/hooks/useAuth';
import { documentsService, type TipoImportacion } from '../services/documents.service';

export default function ImportWizard() {
  const { can } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const [tipo, setTipo] = useState<TipoImportacion>('XML_DTE');
  const [periodo, setPeriodo] = useState('2026-10');
  const importar = useMutation({ mutationFn: (f: File) => documentsService.importar(f, tipo, periodo) });
  const r = importar.data;

  if (!can('documentos:crear')) return <ReadOnlyNotice />;
  return (
    <>
      <Row className="g-2 mb-3">
        <Col md={4}><Form.Label htmlFor="tipo">Tipo de archivo</Form.Label>
          <Form.Select id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoImportacion)}>
            <option value="XML_DTE">XML de DTE</option><option value="RCV_COMPRAS">RCV de compras (CSV)</option><option value="RCV_VENTAS">RCV de ventas (CSV)</option>
          </Form.Select></Col>
        <Col md={3}><Form.Label htmlFor="periodo">Período</Form.Label>
          <Form.Control id="periodo" type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} /></Col>
      </Row>
      {!r && (
        <div className="dropzone" role="button" tabIndex={0} onClick={() => input.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) importar.mutate(f); }}>
          <i className="bi bi-cloud-arrow-up fs-1" />
          <div className="fw-bold">{importar.isPending ? 'Validando formato, folios duplicados y RUT…' : 'Arrastra el archivo aquí o haz clic para elegirlo'}</div>
          <input ref={input} type="file" hidden accept=".xml,.csv" onChange={(e) => e.target.files?.[0] && importar.mutate(e.target.files[0])} />
        </div>
      )}
      {importar.isError && <Alert variant="danger" className="mt-3">{getErrorMessage(importar.error)}</Alert>}
      {r && (
        <>
          <Row className="g-3 mb-3">
            <Col sm={4}><KpiCard label="Registros" value={String(r.total)} hint={r.archivo} icon="bi-files" /></Col>
            <Col sm={4}><KpiCard label="Importados" value={String(r.ok)} icon="bi-check-circle" variant="success" /></Col>
            <Col sm={4}><KpiCard label="Con error" value={String(r.error)} hint="revisa el detalle" icon="bi-x-circle" variant="danger" /></Col>
          </Row>
          <DataTable data={r.errores} rowKey={(e) => e.linea} columns={[
            { header: 'Línea', cell: (e) => e.linea },
            { header: 'Código', cell: (e) => <StatusBadge value={e.codigo === 'FOLIO_DUPLICADO' ? 'PENDIENTE' : 'SIN_DOCUMENTO'} /> },
            { header: 'Detalle', cell: (e) => `${e.codigo}: ${e.mensaje}` },
          ]} />
          <Button className="mt-3" variant="outline-primary" onClick={() => importar.reset()}>Nueva carga</Button>
        </>
      )}
    </>
  );
}

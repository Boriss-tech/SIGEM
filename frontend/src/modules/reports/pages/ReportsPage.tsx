import { Button, Card, Col, Row } from 'react-bootstrap';
import PageHeader from '../../../components/ui/PageHeader';
import { useToast } from '../../../context/ToastContext';
import { getErrorMessage } from '../../../services/api';
import { useAuth } from '../../auth/hooks/useAuth';
import { reportsService } from '../services/reports.service';
import type { FormatoReporte, ReporteDef } from '../types/reports.types';

const REPORTES: ReporteDef[] = [
  { id: 'ventas-periodo', nombre: 'Ventas por período', descripcion: 'Totales por día, medio de pago y cliente', permiso: 'ventas:ver' },
  { id: 'margen-producto', nombre: 'Margen por producto', descripcion: 'Costo, precio y margen de cada producto', permiso: 'ventas:ver' },
  { id: 'compras-proveedor', nombre: 'Compras por proveedor', descripcion: 'Órdenes y montos por proveedor', permiso: 'compras:ver' },
  { id: 'stock-valorizado', nombre: 'Stock valorizado', descripcion: 'Existencias por bodega a costo promedio', permiso: 'inventario:ver' },
  { id: 'por-vencer', nombre: 'Productos por vencer', descripcion: 'Lotes que vencen en los próximos días', permiso: 'inventario:ver' },
  { id: 'libro-contador', nombre: 'Libro para el contador', descripcion: 'Documentos y RCV del período', permiso: 'documentos:ver' },
];

export default function ReportsPage() {
  const { can } = useAuth();
  const toast = useToast();
  const descargar = async (id: string, f: FormatoReporte) => {
    try { toast('Generando reporte…', 'info'); await reportsService.download(id, f); } catch (e) { toast(getErrorMessage(e), 'danger'); }
  };
  return (
    <>
      <PageHeader title="Reportes exportables" subtitle="Solo ves los reportes de tu área" />
      <Row className="g-3">
        {REPORTES.filter((r) => can(r.permiso)).map((r) => (
          <Col key={r.id} md={6} xl={4}>
            <Card className="h-100 shadow-sm"><Card.Body>
              <Card.Title className="h6">{r.nombre}</Card.Title>
              <p className="text-muted">{r.descripcion}</p>
              <Button size="sm" variant="outline-success" className="me-2" onClick={() => descargar(r.id, 'xlsx')}><i className="bi bi-file-earmark-excel me-1" />Excel</Button>
              <Button size="sm" variant="outline-danger" onClick={() => descargar(r.id, 'pdf')}><i className="bi bi-file-earmark-pdf me-1" />PDF</Button>
            </Card.Body></Card>
          </Col>
        ))}
      </Row>
    </>
  );
}

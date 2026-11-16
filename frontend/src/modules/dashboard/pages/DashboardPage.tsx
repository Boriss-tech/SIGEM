import { Card, Col, Row, Spinner } from 'react-bootstrap';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import KpiCard from '../../../components/ui/KpiCard';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatCLP } from '../../../utils/formatCLP';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAlerts } from '../../alerts/hooks/useAlerts';
import { useDashboard } from '../hooks/useDashboard';

/** El mismo panel muestra widgets distintos según los permisos del rol. */
export default function DashboardPage() {
  const { user, can } = useAuth();
  const { data: d, isLoading } = useDashboard();
  const { data: alerts = [] } = useAlerts();
  if (isLoading || !d) return <div className="text-center py-5"><Spinner animation="border" /></div>;

  const col = (node: React.ReactNode, key: string) => <Col sm={6} xl={3} key={key}>{node}</Col>;
  return (
    <>
      <PageHeader title="Panel" subtitle={`Resumen para el rol ${user?.rolNombre}`} />
      <Row className="g-3 mb-3">
        {can('ventas:ver') && [
          col(<KpiCard label="Ventas de hoy" value={formatCLP(d.ventasHoy)} hint="+12% vs ayer" icon="bi-cash-coin" variant="success" />, 'v'),
          col(<KpiCard label="Margen del mes" value={formatCLP(d.margenMes)} hint="27,4% sobre ventas" icon="bi-percent" />, 'm'),
          col(<KpiCard label="Por cobrar" value={formatCLP(d.porCobrar)} hint={`${formatCLP(d.porCobrarVencido)} vencido`} icon="bi-wallet2" variant="warning" />, 'c'),
        ]}
        {can('compras:ver') && [
          col(<KpiCard label="Compras del mes" value={formatCLP(d.comprasMes)} icon="bi-truck" />, 'co'),
          col(<KpiCard label="Por pagar" value={formatCLP(d.porPagar)} icon="bi-credit-card" variant="warning" />, 'p'),
        ]}
        {can('inventario:ver') && col(<KpiCard label="Bajo stock mínimo" value={`${d.bajoMinimo} productos`} hint={`${d.sobrestock} en sobrestock`} icon="bi-exclamation-triangle" variant="danger" />, 'i')}
        {can('documentos:ver') && col(<KpiCard label="RCV conciliado" value={`${d.rcvConciliados} de ${d.rcvTotal}`} hint="período 2026-10" icon="bi-patch-check" variant="success" />, 'r')}
      </Row>
      <Row className="g-3">
        {can('ventas:ver') && (
          <Col lg={7}>
            <Card className="shadow-sm h-100"><Card.Body>
              <Card.Title className="h6">Ventas de los últimos 7 días</Card.Title>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={d.ventasSemana}>
                  <XAxis dataKey="dia" /><YAxis hide />
                  <Tooltip formatter={(v) => formatCLP(Number(v))} />
                  <Bar dataKey="total" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body></Card>
          </Col>
        )}
        <Col lg={can('ventas:ver') ? 5 : 12}>
          <Card className="shadow-sm h-100"><Card.Body>
            <Card.Title className="h6">Alertas recientes</Card.Title>
            {alerts.filter((a) => !a.leida).slice(0, 5).map((a) => (
              <div key={a.id} className="d-flex gap-2 align-items-start mb-2"><StatusBadge value={a.tipo} /><span>{a.mensaje}</span></div>
            ))}
            {!alerts.some((a) => !a.leida) && <p className="text-muted mb-0">Sin alertas pendientes 🎉</p>}
          </Card.Body></Card>
        </Col>
      </Row>
    </>
  );
}

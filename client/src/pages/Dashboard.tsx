import { useQuery } from '@tanstack/react-query';
import { Alert, Col, Row } from 'react-bootstrap';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { request } from '../api/http';
import { formatClp } from '../utils/format';

interface DashboardData {
  ventas: number;
  margen: number;
  porCobrarVencido: number;
  porPagarSemana: number;
  semana: Array<{ fecha: string; ventas: number }>;
  alertas: Array<{ id: number; tipo: string; mensaje: string; fecha_limite: string | null }>;
}

export function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['panel'],
    queryFn: () => request<DashboardData>('/panel'),
  });
  const cards = [
    { label: 'Ventas de hoy', value: data?.ventas, icon: 'bi-cash-stack', tone: 'info' },
    { label: 'Margen de hoy', value: data?.margen, icon: 'bi-graph-up-arrow', tone: 'ok' },
    { label: 'Por cobrar vencido', value: data?.porCobrarVencido, icon: 'bi-exclamation-circle', tone: 'warning' },
    { label: 'Por pagar esta semana', value: data?.porPagarSemana, icon: 'bi-calendar2-week', tone: 'info' },
  ];

  return (
    <>
      <header className="topbar">
        <div>
          <div className="small muted">Minimarket Don Pepe</div>
          <h1 className="h3 fw-bold mb-0">Panel de gestión</h1>
        </div>
        <span className="badge-soft badge-ok"><i className="bi bi-check-circle-fill" aria-hidden="true" /> Datos del sistema</span>
      </header>
      {error && <Alert variant="warning" role="alert">No se pudo cargar el panel. Comprueba que la API y MySQL estén disponibles y vuelve a intentarlo.</Alert>}
      {isLoading && <div className="muted mb-3" role="status">Cargando indicadores…</div>}
      <Row className="g-3 mb-4">
        {cards.map((card) => (
          <Col key={card.label} xs={12} sm={6} xl={3}>
            <section className="stat-card">
              <div className="d-flex justify-content-between align-items-start">
                <div className="muted small">{card.label}</div>
                <span className="stat-icon"><i className={`bi ${card.icon}`} aria-hidden="true" /></span>
              </div>
              <div className="stat-value">{card.value === undefined ? '—' : formatClp(card.value)}</div>
              <div className={`badge-soft badge-${card.tone}`}>{card.label === 'Ventas de hoy' ? 'Acumulado del día' : 'Actualizado al momento'}</div>
            </section>
          </Col>
        ))}
      </Row>
      <Row className="g-3">
        <Col xs={12} xl={8}>
          <section className="surface-card h-100">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div><h2 className="h5 fw-bold mb-1">Ventas de la semana</h2><div className="small muted">Últimos siete días</div></div>
              <i className="bi bi-three-dots muted" aria-hidden="true" />
            </div>
            <div className="chart-wrap" role="img" aria-label="Gráfico de barras con las ventas de los últimos siete días">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.semana ?? []} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
                  <XAxis dataKey="fecha" tickFormatter={(value: string) => new Date(`${value}T12:00:00`).toLocaleDateString('es-CL', { weekday: 'short' })} />
                  <YAxis tickFormatter={(value: number) => `$${Math.round(value / 1000)} mil`} width={64} />
                  <Tooltip formatter={(value) => formatClp(Number(value))} labelFormatter={(value) => new Date(`${value}T12:00:00`).toLocaleDateString('es-CL')} />
                  <Bar dataKey="ventas" name="Venta neta" fill="var(--acc)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </Col>
        <Col xs={12} xl={4}>
          <section className="surface-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div><h2 className="h5 fw-bold mb-1">Alertas pendientes</h2><div className="small muted">Requieren revisión</div></div>
              <span className="badge text-bg-warning">{data?.alertas.length ?? 0}</span>
            </div>
            {data?.alertas.length ? (
              <ul className="list-unstyled mb-0">
                {data.alertas.map((alert) => (
                  <li key={alert.id} className="py-3 border-bottom">
                    <div className="d-flex gap-2"><i className="bi bi-exclamation-triangle text-warning" aria-hidden="true" /><div>
                      <div className="fw-semibold small">{alert.mensaje}</div>
                      <div className="muted small">{alert.fecha_limite ? new Date(`${alert.fecha_limite}T12:00:00`).toLocaleDateString('es-CL') : alert.tipo.replaceAll('_', ' ')}</div>
                    </div></div>
                  </li>
                ))}
              </ul>
            ) : <p className="muted mb-0">No hay alertas pendientes. Volveremos a avisarte cuando haya algo que revisar.</p>}
          </section>
        </Col>
      </Row>
    </>
  );
}

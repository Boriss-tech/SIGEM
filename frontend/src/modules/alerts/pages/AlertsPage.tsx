import { Button, Card } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../../components/ui/PageHeader';
import StatusBadge from '../../../components/ui/StatusBadge';
import { alertsService } from '../services/alerts.service';
import { useAlerts } from '../hooks/useAlerts';

export default function AlertsPage() {
  const qc = useQueryClient();
  const { data: alerts = [] } = useAlerts();
  const marcar = useMutation({
    mutationFn: alertsService.marcarLeida,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
  const pendientes = alerts.filter((a) => !a.leida);
  return (
    <>
      <PageHeader title="Alertas" subtitle="Stock, vencimientos, plazos tributarios y cuentas vencidas" />
      <Card className="shadow-sm"><Card.Body>
        {pendientes.map((a) => (
          <div key={a.id} className="d-flex gap-2 align-items-center py-2 border-bottom">
            <StatusBadge value={a.tipo} /><span>{a.mensaje}</span>
            <Button size="sm" variant="outline-secondary" className="ms-auto" onClick={() => marcar.mutate(a.id)}>Marcar leída</Button>
          </div>
        ))}
        {!pendientes.length && <p className="text-muted mb-0">No hay alertas pendientes 🎉</p>}
      </Card.Body></Card>
    </>
  );
}

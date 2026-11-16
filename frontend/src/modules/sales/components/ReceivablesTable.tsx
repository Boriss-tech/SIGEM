import { Button } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useToast } from '../../../context/ToastContext';
import { formatCLP } from '../../../utils/formatCLP';
import { formatDate } from '../../../utils/formatDate';
import { useAuth } from '../../auth/hooks/useAuth';
import { usePorCobrar } from '../hooks/useSales';
import { salesService } from '../services/sales.service';

export default function ReceivablesTable() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = usePorCobrar();
  const cobrar = useMutation({
    mutationFn: (id: number) => salesService.registrarCobro(id, { monto: 1, medioPago: 'EFECTIVO' }),
    onSuccess: () => { toast('Cobro registrado'); qc.invalidateQueries({ queryKey: ['por-cobrar'] }); },
  });
  return (
    <DataTable loading={isLoading} data={data} rowKey={(c) => c.id} columns={[
      { header: 'Cliente', cell: (c) => c.cliente },
      { header: 'Venta', cell: (c) => c.venta },
      { header: 'Vence', cell: (c) => formatDate(c.vence) },
      { header: 'Saldo', cell: (c) => formatCLP(c.saldo) },
      { header: 'Estado', cell: (c) => <StatusBadge value={c.vencida ? 'VENCIDA' : c.estado} /> },
      { header: '', cell: (c) => can('ventas:editar') ? <Button size="sm" onClick={() => cobrar.mutate(c.id)}>Registrar cobro</Button> : null },
    ]} />
  );
}

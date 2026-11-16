import { Button } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useToast } from '../../../context/ToastContext';
import { formatCLP } from '../../../utils/formatCLP';
import { formatDate } from '../../../utils/formatDate';
import { useAuth } from '../../auth/hooks/useAuth';
import { usePorPagar } from '../hooks/usePurchases';
import { purchasesService } from '../services/purchases.service';

export default function PayablesTable() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = usePorPagar();
  const pagar = useMutation({
    mutationFn: (id: number) => purchasesService.registrarPago(id, { monto: 1, medioPago: 'TRANSFERENCIA' }),
    onSuccess: () => { toast('Pago registrado'); qc.invalidateQueries({ queryKey: ['por-pagar'] }); },
  });
  return (
    <DataTable loading={isLoading} data={data} rowKey={(c) => c.id} columns={[
      { header: 'Proveedor', cell: (c) => c.proveedor },
      { header: 'Documento', cell: (c) => c.documento },
      { header: 'Vence', cell: (c) => formatDate(c.vence) },
      { header: 'Saldo', cell: (c) => formatCLP(c.saldo) },
      { header: 'Estado', cell: (c) => <StatusBadge value={c.estado} /> },
      { header: '', cell: (c) => can('compras:editar') ? <Button size="sm" onClick={() => pagar.mutate(c.id)}>Registrar pago</Button> : null },
    ]} />
  );
}

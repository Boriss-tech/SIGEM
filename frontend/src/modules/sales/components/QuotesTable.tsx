import { Button } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useToast } from '../../../context/ToastContext';
import { formatCLP } from '../../../utils/formatCLP';
import { formatDate } from '../../../utils/formatDate';
import { useAuth } from '../../auth/hooks/useAuth';
import { useCotizaciones } from '../hooks/useSales';
import { salesService } from '../services/sales.service';

export default function QuotesTable() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useCotizaciones();
  const convertir = useMutation({
    mutationFn: salesService.convertirCotizacion,
    onSuccess: () => { toast('Cotización convertida en venta'); qc.invalidateQueries({ queryKey: ['cotizaciones'] }); },
  });
  return (
    <DataTable loading={isLoading} data={data} rowKey={(c) => c.id} columns={[
      { header: 'N°', cell: (c) => c.numero },
      { header: 'Cliente', cell: (c) => c.cliente },
      { header: 'Vigencia', cell: (c) => formatDate(c.vigenciaHasta) },
      { header: 'Total', cell: (c) => formatCLP(c.total) },
      { header: 'Estado', cell: (c) => <StatusBadge value={c.estado} /> },
      { header: '', cell: (c) => c.estado === 'PENDIENTE' && can('ventas:crear')
        ? <Button size="sm" onClick={() => convertir.mutate(c.id)}>Convertir en venta</Button> : null },
    ]} />
  );
}

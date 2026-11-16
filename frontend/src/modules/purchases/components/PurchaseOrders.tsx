import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatCLP } from '../../../utils/formatCLP';
import { formatDate } from '../../../utils/formatDate';
import { useOrdenes } from '../hooks/usePurchases';

export default function PurchaseOrders() {
  const { data, isLoading } = useOrdenes();
  return (
    <DataTable searchable loading={isLoading} data={data} rowKey={(o) => o.id} columns={[
      { header: 'N°', cell: (o) => o.numero },
      { header: 'Proveedor', cell: (o) => o.proveedor },
      { header: 'Fecha', cell: (o) => formatDate(o.fecha) },
      { header: 'Estado', cell: (o) => <StatusBadge value={o.estado} /> },
      { header: 'Total', cell: (o) => formatCLP(o.total) },
    ]} />
  );
}

import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { formatCLP } from '../../../utils/formatCLP';
import { formatDate } from '../../../utils/formatDate';
import { useProducts } from '../hooks/useInventory';
import { situacionStock } from '../utils';

export default function ProductTable() {
  const { data, isLoading } = useProducts();
  return (
    <DataTable searchable loading={isLoading} data={data} rowKey={(p) => p.id} columns={[
      { header: 'Código', cell: (p) => p.codigo },
      { header: 'Producto', cell: (p) => p.nombre },
      { header: 'Categoría', cell: (p) => p.categoria },
      { header: 'Stock', cell: (p) => p.stock },
      { header: 'Mín / Máx', cell: (p) => `${p.stockMinimo} / ${p.stockMaximo ?? '—'}` },
      { header: 'Precio', cell: (p) => formatCLP(p.precioVenta) },
      { header: 'Vence', cell: (p) => formatDate(p.vencimiento) },
      { header: 'Situación', cell: (p) => <StatusBadge value={situacionStock(p)} /> },
    ]} />
  );
}

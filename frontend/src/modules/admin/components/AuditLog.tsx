import DataTable from '../../../components/ui/DataTable';
import { useBitacora } from '../hooks/useAdmin';

export default function AuditLog() {
  const { data, isLoading } = useBitacora();
  return (
    <DataTable searchable loading={isLoading} data={data} rowKey={(b) => b.id} columns={[
      { header: 'Fecha', cell: (b) => b.fecha }, { header: 'Usuario', cell: (b) => b.usuario }, { header: 'Acción', cell: (b) => b.accion },
      { header: 'Entidad', cell: (b) => b.entidad }, { header: 'IP', cell: (b) => b.ip }, { header: 'Detalle', cell: (b) => b.detalle },
    ]} />
  );
}

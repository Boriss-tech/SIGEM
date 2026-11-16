import { Badge } from 'react-bootstrap';
import DataTable from '../../../components/ui/DataTable';
import type { Accion, Modulo } from '../../auth/types/auth.types';
import { useRolesPermisos } from '../hooks/useAdmin';

const MODULOS: { id: Modulo; nombre: string }[] = [
  { id: 'usuarios', nombre: 'Usuarios y roles' }, { id: 'parametros', nombre: 'Parámetros' }, { id: 'compras', nombre: 'Compras' },
  { id: 'inventario', nombre: 'Inventario' }, { id: 'ventas', nombre: 'Ventas y clientes' },
  { id: 'documentos', nombre: 'Documentos y RCV' }, { id: 'reportes', nombre: 'Reportes' },
];
const ACCIONES: Accion[] = ['ver', 'crear', 'editar', 'eliminar'];

/** Vista de solo lectura de la matriz rol × módulo × acción (tablas rol_permiso / permiso). */
export default function RolesMatrix() {
  const { data: roles = [], isLoading } = useRolesPermisos();
  return (
    <DataTable loading={isLoading} data={MODULOS} rowKey={(m) => m.id}
      columns={[
        { header: 'Módulo', cell: (m) => m.nombre },
        ...roles.map((r) => ({
          header: r.nombre,
          cell: (m: { id: Modulo }) => {
            const acc = ACCIONES.filter((a) => r.permisos.includes(`${m.id}:${a}`));
            return acc.length ? acc.map((a) => <Badge key={a} bg="primary" className="me-1">{a}</Badge>) : <span className="text-muted">—</span>;
          },
        })),
      ]} />
  );
}

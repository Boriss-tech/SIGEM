import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DataTable from '../../../components/ui/DataTable';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useToast } from '../../../context/ToastContext';
import { getErrorMessage } from '../../../services/api';
import { useAuth } from '../../auth/hooks/useAuth';
import { useUsuarios } from '../hooks/useAdmin';
import { adminService } from '../services/admin.service';
import UserForm, { type UserFormValues } from './UserForm';

export default function UsersTable() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const { data, isLoading } = useUsuarios();
  const [show, setShow] = useState(false);
  const refresh = () => qc.invalidateQueries({ queryKey: ['usuarios'] });
  const activo = useMutation({ mutationFn: (v: { id: number; activo: boolean }) => adminService.setActivo(v.id, v.activo), onSuccess: refresh });
  const desbloquear = useMutation({ mutationFn: adminService.desbloquear, onSuccess: () => { toast('Usuario desbloqueado'); refresh(); } });

  const crear = async (v: UserFormValues) => {
    try { await adminService.createUsuario(v); toast('Usuario creado'); setShow(false); refresh(); }
    catch (e) { toast(getErrorMessage(e), 'danger'); }
  };
  return (
    <>
      {can('usuarios:crear') && <Button className="mb-3" onClick={() => setShow(true)}><i className="bi bi-person-plus me-1" />Nuevo usuario</Button>}
      <DataTable searchable loading={isLoading} data={data} rowKey={(u) => u.id} columns={[
        { header: 'Nombre', cell: (u) => u.nombre },
        { header: 'Correo', cell: (u) => u.email },
        { header: 'Rol', cell: (u) => u.rol },
        { header: 'Último acceso', cell: (u) => u.ultimoLogin ?? '—' },
        { header: 'Activo', cell: (u) => (
          <Form.Check type="switch" aria-label={`Activo ${u.nombre}`} checked={u.activo} disabled={!can('usuarios:editar')}
            onChange={(e) => activo.mutate({ id: u.id, activo: e.target.checked })} />) },
        { header: '', cell: (u) => u.bloqueado
          ? <><StatusBadge value="BLOQUEADO" /> {can('usuarios:editar') && <Button size="sm" onClick={() => desbloquear.mutate(u.id)}>Desbloquear</Button>}</> : null },
      ]} />
      <UserForm show={show} onHide={() => setShow(false)} onSubmit={crear} />
    </>
  );
}

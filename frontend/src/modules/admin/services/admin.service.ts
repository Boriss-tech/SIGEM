import { api, request } from '../../../services/api';
import { bitacora, parametros, rolesPermisos, usuarios } from '../../../services/mock/db';
import type { BitacoraItem, NuevoUsuario, ParametroEmpresa, RolPermisos, UsuarioAdmin } from '../types/admin.types';

export const adminService = {
  getUsuarios: () => request(() => usuarios, () => api.get<UsuarioAdmin[]>('/usuarios')),
  // POST /usuarios
  createUsuario: (body: NuevoUsuario) => request(() => ({ id: 99 }), () => api.post<{ id: number }>('/usuarios', body)),
  // PATCH /usuarios/:id  { activo }
  setActivo: (id: number, activo: boolean) =>
    request(() => ({ ok: true }), () => api.patch<{ ok: boolean }>(`/usuarios/${id}`, { activo })),
  // POST /usuarios/:id/desbloquear
  desbloquear: (id: number) => request(() => ({ ok: true }), () => api.post<{ ok: boolean }>(`/usuarios/${id}/desbloquear`)),
  getRolesPermisos: () => request(() => rolesPermisos, () => api.get<RolPermisos[]>('/roles-permisos')),
  getBitacora: () => request(() => bitacora, () => api.get<BitacoraItem[]>('/bitacora')),
  getParametros: () => request(() => parametros, () => api.get<ParametroEmpresa[]>('/parametros')),
  // PUT /parametros  [{clave, valor}]
  saveParametros: (body: ParametroEmpresa[]) => request(() => ({ ok: true }), () => api.put<{ ok: boolean }>('/parametros', body)),
};

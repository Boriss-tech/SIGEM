import type { Permiso, RolCodigo } from '../../auth/types/auth.types';

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  email: string;
  rol: RolCodigo;
  activo: boolean;
  bloqueado: boolean;
  ultimoLogin?: string;
}
export interface NuevoUsuario { nombre: string; email: string; rol: RolCodigo; password: string }
export interface RolPermisos { rol: RolCodigo; nombre: string; permisos: Permiso[] }
export interface BitacoraItem { id: number; fecha: string; usuario: string; accion: string; entidad: string; ip: string; detalle: string }
export interface ParametroEmpresa { clave: string; valor: string; descripcion: string }

export type RolCodigo = 'ADMIN' | 'ADMINISTRATIVO' | 'BODEGA' | 'VENTAS' | 'CONTADOR';
export type Modulo = 'usuarios' | 'compras' | 'inventario' | 'ventas' | 'documentos' | 'reportes' | 'parametros';
export type Accion = 'ver' | 'crear' | 'editar' | 'eliminar';
/** Igual que la tabla `permiso` de la BD: "modulo:accion". Ej: "ventas:crear" */
export type Permiso = `${Modulo}:${Accion}`;

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: RolCodigo;
  rolNombre: string;
  empresa: string;
  permisos: Permiso[];
}
export interface LoginRequest { email: string; password: string }
export interface LoginResponse { token: string; user: AuthUser }

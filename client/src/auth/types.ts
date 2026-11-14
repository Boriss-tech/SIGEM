export type Role = 'ADMIN' | 'ADMINISTRATIVO' | 'BODEGA' | 'VENTAS' | 'CONTADOR';
export type ModuleName =
  | 'usuarios'
  | 'compras'
  | 'inventario'
  | 'ventas'
  | 'documentos'
  | 'reportes'
  | 'parametros';
export type Action = 'ver' | 'crear' | 'editar' | 'eliminar';

export interface Permission {
  modulo: ModuleName;
  accion: Action;
}

export interface SessionUser {
  id: number;
  empresaId: number;
  nombre: string;
  email: string;
  rol: Role;
  permisos: Permission[];
}

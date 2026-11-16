export interface Producto {
  id: number;
  codigo: string;
  codigoBarras?: string;
  nombre: string;
  categoria: string;
  unidad: string;
  costoPromedio: number;
  precioVenta: number;
  stock: number; // suma de todas las bodegas (vista v_stock_total)
  stockMinimo: number;
  stockMaximo?: number;
  vencimiento?: string; // AAAA-MM-DD
  activo: boolean;
}
export type SituacionStock = 'BAJO_MINIMO' | 'NORMAL' | 'SOBRESTOCK';
export type TipoMovimiento =
  | 'ENTRADA_COMPRA' | 'SALIDA_VENTA' | 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO'
  | 'TRASPASO_ENTRADA' | 'TRASPASO_SALIDA' | 'DEVOLUCION_VENTA' | 'DEVOLUCION_COMPRA';
export interface MovimientoKardex {
  id: number;
  fecha: string;
  producto: string;
  tipo: TipoMovimiento;
  cantidad: number;
  saldoPosterior: number;
  origen: string;
  usuario: string;
}
export interface ConteoLinea {
  productoId: number;
  producto: string;
  cantidadSistema: number;
  cantidadContada?: number;
}

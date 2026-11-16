export interface OrdenCompra {
  id: number;
  numero: string;
  proveedor: string;
  fecha: string;
  estado: 'BORRADOR' | 'EMITIDA' | 'RECIBIDA_PARCIAL' | 'RECIBIDA' | 'ANULADA';
  total: number;
}
export interface LineaRecepcion {
  productoId: number;
  producto: string;
  pedido: number;
  recibido: number; // lo ya recibido; por recibir = pedido - recibido
}
export interface RecepcionPendiente { ordenCompraId: number; numero: string; proveedor: string; lineas: LineaRecepcion[] }
export interface NuevaRecepcion { ordenCompraId: number; lineas: { productoId: number; cantidad: number }[] }
export interface CuentaPorPagar {
  id: number;
  proveedor: string;
  documento: string;
  vence: string;
  saldo: number;
  estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'ANULADA';
}

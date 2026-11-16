export interface Cliente { id: number; razonSocial: string; rut?: string }
export interface NuevaVenta {
  clienteId?: number; // vacío = consumidor final
  formaPago: 'CONTADO' | 'CREDITO';
  medioPago: string;
  folioExterno?: string; // folio del documento emitido en otro sistema (RF-18)
  lineas: { productoId: number; cantidad: number }[];
}
export interface Cotizacion {
  id: number;
  numero: string;
  cliente: string;
  vigenciaHasta: string;
  total: number;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'VENCIDA' | 'CONVERTIDA';
}
export interface CuentaPorCobrar {
  id: number;
  cliente: string;
  venta: string;
  vence: string;
  saldo: number;
  vencida: boolean;
  estado: 'PENDIENTE' | 'PARCIAL' | 'COBRADA' | 'ANULADA';
}

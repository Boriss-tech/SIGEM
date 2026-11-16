export interface DocumentoTributario {
  id: number;
  tipo: string; // ej: "33 Factura electrónica"
  folio: number;
  contraparte: string;
  fecha: string;
  total: number;
  estado: 'IMPORTADO' | 'VINCULADO' | 'ANULADO';
}
export interface ErrorImportacion { linea: number; codigo: string; mensaje: string }
export interface ResultadoImportacion { archivo: string; total: number; ok: number; error: number; errores: ErrorImportacion[] }
export interface RcvRegistro {
  id: number;
  libro: 'COMPRA' | 'VENTA';
  tipo: number;
  folio: number;
  contraparte: string;
  monto: number;
  estado: 'PENDIENTE' | 'CONCILIADO' | 'DIFERENCIA_MONTO' | 'SIN_DOCUMENTO';
  detalle?: string; // ej: "Sistema $186.000 vs RCV $186.300"
}
export interface Conciliacion {
  periodo: string; // AAAA-MM
  resumen: { conciliados: number; diferencia: number; sinDocumento: number; pendientes: number };
  registros: RcvRegistro[];
}

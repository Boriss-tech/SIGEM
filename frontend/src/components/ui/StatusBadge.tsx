import { Badge } from 'react-bootstrap';

const VARIANT: Record<string, string> = {
  // verdes
  NORMAL: 'success', CONCILIADO: 'success', RECIBIDA: 'success', PAGADA: 'success', COBRADA: 'success',
  VINCULADO: 'success', CONVERTIDA: 'success', ACEPTADA: 'success', ENTRADA_COMPRA: 'success', ACTIVO: 'success',
  // amarillos
  PENDIENTE: 'warning', PARCIAL: 'warning', RECIBIDA_PARCIAL: 'warning', SOBRESTOCK: 'warning', DIFERENCIA_MONTO: 'warning',
  VENCIMIENTO: 'warning', TRASPASO_ENTRADA: 'warning', TRASPASO_SALIDA: 'warning', IMPORTADO: 'primary',
  // rojos
  BAJO_MINIMO: 'danger', SIN_DOCUMENTO: 'danger', VENCIDA: 'danger', AJUSTE_NEGATIVO: 'danger', CUENTA_VENCIDA: 'danger',
  STOCK_MINIMO: 'danger', INACTIVO: 'danger', BLOQUEADO: 'danger',
  // azules
  EMITIDA: 'primary', SALIDA_VENTA: 'primary', PLAZO_TRIBUTARIO: 'primary', AJUSTE_POSITIVO: 'info',
  // grises
  BORRADOR: 'secondary', ANULADA: 'secondary', ANULADO: 'secondary', RECHAZADA: 'secondary',
};

/** Traduce el ENUM de la BD a un badge de Bootstrap (siempre con texto, no solo color). */
export default function StatusBadge({ value }: { value: string }) {
  const v = VARIANT[value] ?? 'secondary';
  const label = value.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
  return <Badge bg={v} text={v === 'warning' ? 'dark' : undefined}>{label}</Badge>;
}

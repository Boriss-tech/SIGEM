import { api, request } from '../../../services/api';
import { ordenes, porPagar, recepcionPendiente } from '../../../services/mock/db';
import type { CuentaPorPagar, NuevaRecepcion, OrdenCompra, RecepcionPendiente } from '../types/purchases.types';

export const purchasesService = {
  getOrdenes: () => request(() => ordenes, () => api.get<OrdenCompra[]>('/ordenes-compra')),
  // GET /ordenes-compra/pendiente-recepcion -> la OC a recibir con sus líneas
  getRecepcionPendiente: () =>
    request(() => recepcionPendiente, () => api.get<RecepcionPendiente>('/ordenes-compra/pendiente-recepcion')),
  // POST /recepciones -> suma stock, crea kardex y actualiza lo recibido de la OC
  confirmarRecepcion: (body: NuevaRecepcion) =>
    request(() => ({ ok: true }), () => api.post<{ ok: boolean }>('/recepciones', body)),
  getPorPagar: () => request(() => porPagar, () => api.get<CuentaPorPagar[]>('/cuentas-por-pagar')),
  // POST /cuentas-por-pagar/:id/pagos  { monto, medioPago }
  registrarPago: (id: number, body: { monto: number; medioPago: string }) =>
    request(() => ({ ok: true }), () => api.post<{ ok: boolean }>(`/cuentas-por-pagar/${id}/pagos`, body)),
};

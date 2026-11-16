import { api, request } from '../../../services/api';
import { clientes, cotizaciones, porCobrar } from '../../../services/mock/db';
import type { Cliente, Cotizacion, CuentaPorCobrar, NuevaVenta } from '../types/sales.types';

export const salesService = {
  getClientes: () => request(() => clientes, () => api.get<Cliente[]>('/clientes')),
  // POST /ventas -> el backend descuenta stock y crea movimientos de kardex en una transacción
  createSale: (body: NuevaVenta) => request(() => ({ id: 1052 }), () => api.post<{ id: number }>('/ventas', body)),
  getCotizaciones: () => request(() => cotizaciones, () => api.get<Cotizacion[]>('/cotizaciones')),
  // POST /cotizaciones/:id/convertir
  convertirCotizacion: (id: number) =>
    request(() => ({ ventaId: 1053 }), () => api.post<{ ventaId: number }>(`/cotizaciones/${id}/convertir`)),
  getPorCobrar: () => request(() => porCobrar, () => api.get<CuentaPorCobrar[]>('/cuentas-por-cobrar')),
  // POST /cuentas-por-cobrar/:id/cobros  { monto, medioPago }
  registrarCobro: (id: number, body: { monto: number; medioPago: string }) =>
    request(() => ({ ok: true }), () => api.post<{ ok: boolean }>(`/cuentas-por-cobrar/${id}/cobros`, body)),
};

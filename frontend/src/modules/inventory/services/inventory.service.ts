import { api, request } from '../../../services/api';
import { conteo, kardex, productos } from '../../../services/mock/db';
import type { ConteoLinea, MovimientoKardex, Producto } from '../types/inventory.types';

export const inventoryService = {
  // GET /productos
  getProducts: () => request(() => productos, () => api.get<Producto[]>('/productos')),
  // GET /inventario/kardex
  getKardex: () => request(() => kardex, () => api.get<MovimientoKardex[]>('/inventario/kardex')),
  // GET /conteos/actual
  getConteo: () => request(() => conteo, () => api.get<ConteoLinea[]>('/conteos/actual')),
  // POST /conteos/ajustar  { lineas, motivo }  -> genera AJUSTE_POSITIVO / AJUSTE_NEGATIVO en el kardex
  ajustarConteo: (body: { lineas: ConteoLinea[]; motivo: string }) =>
    request(() => ({ ok: true }), () => api.post<{ ok: boolean }>('/conteos/ajustar', body)),
};

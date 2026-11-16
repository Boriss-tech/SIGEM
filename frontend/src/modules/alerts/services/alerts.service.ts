import { api, request } from '../../../services/api';
import { alertas } from '../../../services/mock/db';
import type { Alerta } from '../types/alerts.types';

export const alertsService = {
  // GET /alertas
  getAll: () => request(() => alertas, () => api.get<Alerta[]>('/alertas')),
  // PATCH /alertas/:id/leida
  marcarLeida: (id: number) => request(() => { const a = alertas.find((x) => x.id === id); if (a) a.leida = true; return { ok: true }; }, () => api.patch<{ ok: boolean }>(`/alertas/${id}/leida`)),
};

import { api, USE_MOCK, delay } from '../../../services/api';
import { downloadBlob } from '../../../utils/downloadBlob';
import type { FormatoReporte } from '../types/reports.types';

export const reportsService = {
  // GET /reportes/:id?format=xlsx|pdf  (respuesta blob)
  download: async (id: string, formato: FormatoReporte) => {
    if (USE_MOCK) {
      await delay(500);
      downloadBlob(new Blob([`Reporte ${id} (demo)`], { type: 'text/plain' }), `${id}.${formato === 'pdf' ? 'txt' : 'txt'}`);
      return;
    }
    const { data } = await api.get<Blob>(`/reportes/${id}`, { params: { format: formato }, responseType: 'blob' });
    downloadBlob(data, `${id}.${formato}`);
  },
};

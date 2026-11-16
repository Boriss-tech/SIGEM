import { api, request } from '../../../services/api';
import { conciliacion, documentos, resultadoImportacion } from '../../../services/mock/db';
import type { Conciliacion, DocumentoTributario, ResultadoImportacion } from '../types/documents.types';

export type TipoImportacion = 'XML_DTE' | 'RCV_COMPRAS' | 'RCV_VENTAS';

export const documentsService = {
  // GET /documentos?tipo=&folio=&proveedor=
  getDocumentos: () => request(() => documentos, () => api.get<DocumentoTributario[]>('/documentos')),
  // GET /documentos/:id/xml  (respuesta blob)
  descargarXml: (id: number) =>
    request(() => new Blob(['<DTE>demo</DTE>'], { type: 'application/xml' }), () =>
      api.get<Blob>(`/documentos/${id}/xml`, { responseType: 'blob' })),
  // POST /importaciones  (multipart: file, tipo, periodo?) -> ResultadoImportacion
  importar: (file: File, tipo: TipoImportacion, periodo?: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('tipo', tipo);
    if (periodo) form.append('periodo', periodo);
    return request(() => resultadoImportacion(file.name), () =>
      api.post<ResultadoImportacion>('/importaciones', form, { headers: { 'Content-Type': 'multipart/form-data' } }));
  },
  // GET /rcv/conciliacion?periodo=AAAA-MM
  getConciliacion: (periodo: string) =>
    request(() => conciliacion, () => api.get<Conciliacion>('/rcv/conciliacion', { params: { periodo } })),
};

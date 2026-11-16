import { useQuery } from '@tanstack/react-query';
import { documentsService } from '../services/documents.service';

export const useDocumentos = () => useQuery({ queryKey: ['documentos'], queryFn: documentsService.getDocumentos });
export const useConciliacion = (periodo: string) =>
  useQuery({ queryKey: ['conciliacion', periodo], queryFn: () => documentsService.getConciliacion(periodo) });

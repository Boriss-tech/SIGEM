import { useQuery } from '@tanstack/react-query';
import { purchasesService } from '../services/purchases.service';

export const useOrdenes = () => useQuery({ queryKey: ['ordenes'], queryFn: purchasesService.getOrdenes });
export const useRecepcionPendiente = () => useQuery({ queryKey: ['recepcion'], queryFn: purchasesService.getRecepcionPendiente });
export const usePorPagar = () => useQuery({ queryKey: ['por-pagar'], queryFn: purchasesService.getPorPagar });

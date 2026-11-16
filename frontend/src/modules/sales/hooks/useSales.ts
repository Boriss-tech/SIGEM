import { useQuery } from '@tanstack/react-query';
import { salesService } from '../services/sales.service';

export const useClientes = () => useQuery({ queryKey: ['clientes'], queryFn: salesService.getClientes });
export const useCotizaciones = () => useQuery({ queryKey: ['cotizaciones'], queryFn: salesService.getCotizaciones });
export const usePorCobrar = () => useQuery({ queryKey: ['por-cobrar'], queryFn: salesService.getPorCobrar });

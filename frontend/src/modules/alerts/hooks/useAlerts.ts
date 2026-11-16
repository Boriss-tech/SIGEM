import { useQuery } from '@tanstack/react-query';
import { alertsService } from '../services/alerts.service';

// refetchInterval: refresca la campana sin recargar la página
export const useAlerts = () => useQuery({ queryKey: ['alerts'], queryFn: alertsService.getAll, refetchInterval: 60000 });

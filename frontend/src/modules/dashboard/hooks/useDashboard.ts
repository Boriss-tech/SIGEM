import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';

export const useDashboard = () => useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.get });

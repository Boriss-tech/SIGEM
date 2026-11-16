import { api, request } from '../../../services/api';
import { dashboard } from '../../../services/mock/db';
import type { DashboardData } from '../types/dashboard.types';

export const dashboardService = {
  // GET /dashboard
  get: () => request(() => dashboard, () => api.get<DashboardData>('/dashboard')),
};

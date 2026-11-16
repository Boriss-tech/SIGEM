import type { Permiso } from '../../auth/types/auth.types';
export interface ReporteDef { id: string; nombre: string; descripcion: string; permiso: Permiso }
export type FormatoReporte = 'xlsx' | 'pdf';

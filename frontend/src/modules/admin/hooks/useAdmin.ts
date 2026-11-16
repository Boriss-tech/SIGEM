import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';

export const useUsuarios = () => useQuery({ queryKey: ['usuarios'], queryFn: adminService.getUsuarios });
export const useRolesPermisos = () => useQuery({ queryKey: ['roles-permisos'], queryFn: adminService.getRolesPermisos });
export const useBitacora = () => useQuery({ queryKey: ['bitacora'], queryFn: adminService.getBitacora });
export const useParametros = () => useQuery({ queryKey: ['parametros'], queryFn: adminService.getParametros });

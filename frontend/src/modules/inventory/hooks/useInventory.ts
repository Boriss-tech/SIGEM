import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventory.service';

export const useProducts = () => useQuery({ queryKey: ['products'], queryFn: inventoryService.getProducts });
export const useKardex = () => useQuery({ queryKey: ['kardex'], queryFn: inventoryService.getKardex });
export const useConteo = () => useQuery({ queryKey: ['conteo'], queryFn: inventoryService.getConteo });

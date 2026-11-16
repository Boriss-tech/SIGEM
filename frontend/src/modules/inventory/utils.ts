import type { Producto, SituacionStock } from './types/inventory.types';

export function situacionStock(p: Producto): SituacionStock {
  if (p.stock < p.stockMinimo) return 'BAJO_MINIMO';
  if (p.stockMaximo && p.stock > p.stockMaximo) return 'SOBRESTOCK';
  return 'NORMAL';
}

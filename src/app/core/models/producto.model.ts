export type EstadoProducto = 'Disponible' | 'Stock Bajo' | 'Stock Crítico' | 'Sobrestock';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  proveedor: string;
  stockActual: number;
  stockMinimo: number;
  stockMaximo: number;
  precio: number;
  estado: EstadoProducto;
}

/**
 * Calcula el estado del producto en base a sus umbrales de stock.
 * - Stock Crítico: stockActual <= stockMinimo * 0.5
 * - Stock Bajo: stockActual <= stockMinimo
 * - Sobrestock: stockActual > stockMaximo
 * - Disponible: cualquier otro caso
 */
export function calcularEstadoProducto(p: Pick<Producto, 'stockActual' | 'stockMinimo' | 'stockMaximo'>): EstadoProducto {
  if (p.stockActual <= p.stockMinimo * 0.5) return 'Stock Crítico';
  if (p.stockActual <= p.stockMinimo) return 'Stock Bajo';
  if (p.stockActual > p.stockMaximo) return 'Sobrestock';
  return 'Disponible';
}

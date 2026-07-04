export type EstadoOrden = 'Pendiente' | 'En proceso' | 'Recibida';

export interface OrdenItem {
  productoId: number;
  productoNombre: string;
  cantidad: number;
}

export interface OrdenCompra {
  id: number;
  numeroOrden: string;
  proveedor: string;
  items: OrdenItem[];
  fecha: string; // ISO date
  estado: EstadoOrden;
}

export type TipoAlerta = 'stock_bajo' | 'stock_critico' | 'sobrestock';
export type SeveridadAlerta = 'info' | 'advertencia' | 'critica';

export interface Alerta {
  id: number;
  productoId: number;
  productoNombre: string;
  tipo: TipoAlerta;
  severidad: SeveridadAlerta;
  mensaje: string;
  fecha: string; // ISO date
  leida: boolean;
}

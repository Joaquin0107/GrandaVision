import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ProductosService } from './productos.service';
import { Producto } from '../models/producto.model';

export interface Recomendacion {
  productoId: number;
  productoNombre: string;
  tipo: 'comprar' | 'no_comprar' | 'ok';
  mensaje: string;
}

/**
 * Motor de recomendaciones basado 100% en reglas de negocio explícitas
 * (sin IA). Cada regla es determinística y auditable.
 */
@Injectable({ providedIn: 'root' })
export class RecomendacionesService {
  private productosService = inject(ProductosService);

  getRecomendaciones(): Observable<Recomendacion[]> {
    return this.productosService.getAll().pipe(
      map(productos => productos.map(p => this.evaluar(p)).filter((r): r is Recomendacion => r !== null)),
    );
  }

  private evaluar(p: Producto): Recomendacion | null {
    if (p.stockActual < p.stockMinimo) {
      return {
        productoId: p.id,
        productoNombre: p.nombre,
        tipo: 'comprar',
        mensaje: 'Se recomienda generar una orden de compra.',
      };
    }
    if (p.stockActual > p.stockMaximo) {
      return {
        productoId: p.id,
        productoNombre: p.nombre,
        tipo: 'no_comprar',
        mensaje: 'Existe sobrestock. No realizar compras.',
      };
    }
    return null;
  }
}

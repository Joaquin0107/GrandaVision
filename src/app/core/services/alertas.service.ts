import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap, of, delay } from 'rxjs';
import { LocalStoreService } from './local-store.service';
import { Alerta } from '../models/alerta.model';
import { ProductosService } from './productos.service';

const KEY = 'alertas';
const LATENCY = 200;

@Injectable({ providedIn: 'root' })
export class AlertasService {
  private store = inject(LocalStoreService);
  private productosService = inject(ProductosService);

  /**
   * Regenera la lista de alertas activas a partir del estado actual del
   * inventario (regla de negocio, sin IA). Conserva el flag `leida` de
   * alertas ya existentes para el mismo producto/tipo.
   */
  private regenerar(): Observable<Alerta[]> {
    return this.productosService.getAll().pipe(
      switchMap(productos => {
        const previas = JSON.parse(localStorage.getItem('gv_' + KEY) || '[]') as Alerta[];
        let nextId = this.store.nextId(previas);
        const nuevas: Alerta[] = [];

        for (const p of productos) {
          if (p.estado === 'Stock Crítico' || p.estado === 'Stock Bajo') {
            const existente = previas.find(a => a.productoId === p.id && a.tipo !== 'sobrestock');
            nuevas.push({
              id: existente?.id ?? nextId++,
              productoId: p.id,
              productoNombre: p.nombre,
              tipo: p.estado === 'Stock Crítico' ? 'stock_critico' : 'stock_bajo',
              severidad: p.estado === 'Stock Crítico' ? 'critica' : 'advertencia',
              mensaje: 'Producto próximo a agotarse. Se recomienda generar una orden de compra.',
              fecha: existente?.fecha ?? new Date().toISOString(),
              leida: existente?.leida ?? false,
            });
          } else if (p.estado === 'Sobrestock') {
            const existente = previas.find(a => a.productoId === p.id && a.tipo === 'sobrestock');
            nuevas.push({
              id: existente?.id ?? nextId++,
              productoId: p.id,
              productoNombre: p.nombre,
              tipo: 'sobrestock',
              severidad: 'info',
              mensaje: 'Existe sobrestock de este producto. No se recomienda generar nuevas compras.',
              fecha: existente?.fecha ?? new Date().toISOString(),
              leida: existente?.leida ?? false,
            });
          }
        }

        this.store.saveCollection(KEY, nuevas);
        return of(nuevas);
      }),
    );
  }

  getAll(): Observable<Alerta[]> {
    return this.regenerar().pipe(delay(LATENCY));
  }

  marcarLeida(id: number): Observable<void> {
    const actuales = JSON.parse(localStorage.getItem('gv_' + KEY) || '[]') as Alerta[];
    const actualizadas = actuales.map(a => (a.id === id ? { ...a, leida: true } : a));
    this.store.saveCollection(KEY, actualizadas);
    return of(void 0).pipe(delay(LATENCY));
  }

  contarActivas(): Observable<number> {
    return this.getAll().pipe(map(alertas => alertas.filter(a => !a.leida).length));
  }
}

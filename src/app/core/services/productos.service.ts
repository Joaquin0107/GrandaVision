import { Injectable, inject } from '@angular/core';
import { Observable, map, delay, switchMap, of } from 'rxjs';
import { LocalStoreService } from './local-store.service';
import { Producto, calcularEstadoProducto } from '../models/producto.model';

const KEY = 'productos';
/** Pequeña latencia simulada para que el fake backend "se sienta" como una API real. */
const LATENCY = 250;

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private store = inject(LocalStoreService);

  private conEstado(items: Producto[]): Producto[] {
    return items.map(p => ({ ...p, estado: calcularEstadoProducto(p) }));
  }

  getAll(): Observable<Producto[]> {
    return this.store.getCollection<Producto>(KEY).pipe(
      map(items => this.conEstado(items)),
      delay(LATENCY),
    );
  }

  getById(id: number): Observable<Producto | undefined> {
    return this.getAll().pipe(map(items => items.find(p => p.id === id)));
  }

  create(producto: Omit<Producto, 'id' | 'estado'>): Observable<Producto> {
    return this.store.getCollection<Producto>(KEY).pipe(
      switchMap(items => {
        const nuevo: Producto = {
          ...producto,
          id: this.store.nextId(items),
          estado: calcularEstadoProducto(producto),
        };
        this.store.saveCollection(KEY, [...items, nuevo]);
        return of(nuevo).pipe(delay(LATENCY));
      }),
    );
  }

  update(id: number, cambios: Partial<Producto>): Observable<Producto> {
    return this.store.getCollection<Producto>(KEY).pipe(
      switchMap(items => {
        const actualizado = items.map(p =>
          p.id === id ? { ...p, ...cambios, estado: calcularEstadoProducto({ ...p, ...cambios }) } : p,
        );
        this.store.saveCollection(KEY, actualizado);
        const resultado = actualizado.find(p => p.id === id)!;
        return of(resultado).pipe(delay(LATENCY));
      }),
    );
  }

  delete(id: number): Observable<void> {
    return this.store.getCollection<Producto>(KEY).pipe(
      switchMap(items => {
        this.store.saveCollection(KEY, items.filter(p => p.id !== id));
        return of(void 0).pipe(delay(LATENCY));
      }),
    );
  }

  /** Categorías únicas presentes en el inventario, para el filtro. */
  getCategorias(): Observable<string[]> {
    return this.getAll().pipe(map(items => [...new Set(items.map(p => p.categoria))].sort()));
  }
}

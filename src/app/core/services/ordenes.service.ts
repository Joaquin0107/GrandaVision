import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, of, delay } from 'rxjs';
import { LocalStoreService } from './local-store.service';
import { OrdenCompra } from '../models/orden.model';

const KEY = 'ordenes';
const LATENCY = 250;

@Injectable({ providedIn: 'root' })
export class OrdenesService {
  private store = inject(LocalStoreService);

  getAll(): Observable<OrdenCompra[]> {
    return this.store.getCollection<OrdenCompra>(KEY).pipe(delay(LATENCY));
  }

  create(orden: Omit<OrdenCompra, 'id'>): Observable<OrdenCompra> {
    return this.store.getCollection<OrdenCompra>(KEY).pipe(
      switchMap(items => {
        const nueva: OrdenCompra = { ...orden, id: this.store.nextId(items) };
        this.store.saveCollection(KEY, [...items, nueva]);
        return of(nueva).pipe(delay(LATENCY));
      }),
    );
  }

  update(id: number, cambios: Partial<OrdenCompra>): Observable<OrdenCompra> {
    return this.store.getCollection<OrdenCompra>(KEY).pipe(
      switchMap(items => {
        const actualizadas = items.map(o => (o.id === id ? { ...o, ...cambios } : o));
        this.store.saveCollection(KEY, actualizadas);
        return of(actualizadas.find(o => o.id === id)!).pipe(delay(LATENCY));
      }),
    );
  }

  delete(id: number): Observable<void> {
    return this.store.getCollection<OrdenCompra>(KEY).pipe(
      switchMap(items => {
        this.store.saveCollection(KEY, items.filter(o => o.id !== id));
        return of(void 0).pipe(delay(LATENCY));
      }),
    );
  }

  siguienteNumeroOrden(): Observable<string> {
    return this.getAll().pipe(
      switchMap(items => {
        const year = new Date().getFullYear();
        const n = items.length + 1;
        return of(`OC-${year}-${String(n).padStart(3, '0')}`);
      }),
    );
  }
}

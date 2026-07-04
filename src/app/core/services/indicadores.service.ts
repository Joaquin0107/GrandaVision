import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap, delay } from 'rxjs';
import { LocalStoreService } from './local-store.service';
import { Indicadores } from '../models/indicadores.model';
import { ProductosService } from './productos.service';

const KEY = 'indicadores';

@Injectable({ providedIn: 'root' })
export class IndicadoresService {
  private store = inject(LocalStoreService);
  private productosService = inject(ProductosService);

  /** KPIs base (erp/reposición/histórico) + disponibilidad y sobrestock recalculados en vivo. */
  getIndicadores(): Observable<Indicadores> {
    return this.store.getObject<Indicadores>(KEY).pipe(
      switchMap(base =>
        this.productosService.getAll().pipe(
          map(productos => {
            const total = productos.length || 1;
            const criticos = productos.filter(p => p.estado === 'Stock Crítico' || p.estado === 'Stock Bajo').length;
            const sobrestock = productos.filter(p => p.estado === 'Sobrestock').length;
            return {
              ...base,
              disponibilidad: Math.round(((total - criticos) / total) * 100),
              sobrestock: Math.round((sobrestock / total) * 100),
            };
          }),
        ),
      ),
      delay(200),
    );
  }
}

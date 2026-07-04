import { Injectable, inject } from '@angular/core';
import { Observable, delay } from 'rxjs';
import { LocalStoreService } from './local-store.service';
import { Proveedor } from '../models/proveedor.model';

const KEY = 'proveedores';

@Injectable({ providedIn: 'root' })
export class ProveedoresService {
  private store = inject(LocalStoreService);

  getAll(): Observable<Proveedor[]> {
    return this.store.getCollection<Proveedor>(KEY).pipe(delay(200));
  }
}

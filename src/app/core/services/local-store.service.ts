import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map } from 'rxjs';

/**
 * LocalStoreService — corazón del "Fake Backend".
 *
 * La primera vez que se pide una colección, se carga desde
 * assets/data/*.json y se copia a localStorage. A partir de ahí,
 * todas las operaciones (GET/POST/PUT/DELETE) leen y escriben
 * exclusivamente en localStorage, simulando persistencia real.
 *
 * Cuando en el futuro exista una API REST real, basta con
 * reemplazar la implementación de este servicio (o de los
 * servicios de dominio que lo consumen) sin tocar los componentes.
 */
@Injectable({ providedIn: 'root' })
export class LocalStoreService {
  private http = inject(HttpClient);
  private readonly prefix = 'gv_';

  /** Devuelve la colección; la siembra desde JSON si aún no existe en localStorage. */
  getCollection<T>(key: string): Observable<T[]> {
    const raw = localStorage.getItem(this.prefix + key);
    if (raw) {
      return of(JSON.parse(raw) as T[]);
    }
    return this.http.get<T[]>(`assets/data/${key}.json`).pipe(
      tap(data => localStorage.setItem(this.prefix + key, JSON.stringify(data))),
    );
  }

  /** Devuelve un objeto único (no-array), sembrando desde JSON si es necesario. */
  getObject<T>(key: string): Observable<T> {
    const raw = localStorage.getItem(this.prefix + key);
    if (raw) {
      return of(JSON.parse(raw) as T);
    }
    return this.http.get<T>(`assets/data/${key}.json`).pipe(
      tap(data => localStorage.setItem(this.prefix + key, JSON.stringify(data))),
    );
  }

  saveCollection<T>(key: string, data: T[]): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  }

  saveObject<T>(key: string, data: T): void {
    localStorage.setItem(this.prefix + key, JSON.stringify(data));
  }

  /** Genera el siguiente id incremental de una colección. */
  nextId<T extends { id: number }>(items: T[]): number {
    return items.reduce((max, i) => (i.id > max ? i.id : max), 0) + 1;
  }

  /** Restablece una colección a sus datos originales de assets/data. */
  reset(key: string): Observable<unknown> {
    localStorage.removeItem(this.prefix + key);
    return this.http.get(`assets/data/${key}.json`).pipe(
      tap(data => localStorage.setItem(this.prefix + key, JSON.stringify(data))),
    );
  }
}

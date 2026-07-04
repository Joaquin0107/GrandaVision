import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, delay, switchMap, throwError } from 'rxjs';
import { LocalStoreService } from './local-store.service';
import { Usuario, SesionActiva } from '../models/usuario.model';

const SESSION_KEY = 'gv_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private store = inject(LocalStoreService);

  /** Señal reactiva con la sesión activa (o null), para pintar navbar/sidebar al instante. */
  readonly sesion = signal<SesionActiva | null>(this.leerSesion());

  private leerSesion(): SesionActiva | null {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SesionActiva) : null;
  }

  login(usuario: string, password: string): Observable<SesionActiva> {
    return this.store.getCollection<Usuario>('usuarios').pipe(
      delay(400), // pequeña latencia simulada de "autenticación"
      switchMap(usuarios => {
        const encontrado = usuarios.find(u => u.usuario === usuario && u.password === password);
        if (!encontrado) {
          return throwError(() => new Error('Usuario o contraseña incorrectos.'));
        }
        const sesion: SesionActiva = {
          id: encontrado.id,
          usuario: encontrado.usuario,
          nombreCompleto: encontrado.nombreCompleto,
          rol: encontrado.rol,
          loginAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
        this.sesion.set(sesion);
        return of(sesion);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this.sesion.set(null);
  }

  isLoggedIn(): boolean {
    return this.sesion() !== null;
  }
}

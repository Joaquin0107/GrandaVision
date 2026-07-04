import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { LocalStoreService } from '../../core/services/local-store.service';

const COLECCIONES = ['productos', 'ordenes', 'alertas', 'indicadores', 'proveedores'];

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.scss',
})
export class Configuracion {
  private auth = inject(AuthService);
  private store = inject(LocalStoreService);
  private snack = inject(MatSnackBar);

  readonly sesion = this.auth.sesion;
  readonly restableciendo = signal(false);

  restablecerDatos(): void {
    if (!confirm('Esto restablecerá todos los datos del prototipo (inventario, órdenes, alertas) a sus valores originales. ¿Continuar?')) {
      return;
    }
    this.restableciendo.set(true);
    Promise.all(COLECCIONES.map(c => this.store.reset(c).toPromise())).then(() => {
      this.restableciendo.set(false);
      this.snack.open('Datos del prototipo restablecidos.', 'Cerrar', { duration: 3000 });
    });
  }
}

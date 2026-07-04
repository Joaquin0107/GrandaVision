import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AlertasService } from '../../core/services/alertas.service';
import { Alerta } from '../../core/models/alerta.model';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './alertas.html',
  styleUrl: './alertas.scss',
})
export class Alertas implements OnInit {
  private alertasService = inject(AlertasService);

  readonly alertas = signal<Alerta[]>([]);
  readonly cargando = signal(true);

  readonly criticas = computed(() => this.alertas().filter(a => a.severidad === 'critica'));
  readonly advertencias = computed(() => this.alertas().filter(a => a.severidad === 'advertencia'));
  readonly informativas = computed(() => this.alertas().filter(a => a.severidad === 'info'));

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.alertasService.getAll().subscribe(data => {
      // Más recientes / no leídas primero
      const ordenadas = [...data].sort((a, b) => Number(a.leida) - Number(b.leida));
      this.alertas.set(ordenadas);
      this.cargando.set(false);
    });
  }

  marcarLeida(alerta: Alerta): void {
    this.alertasService.marcarLeida(alerta.id).subscribe(() => this.cargar());
  }

  icono(alerta: Alerta): string {
    switch (alerta.tipo) {
      case 'stock_critico': return 'error';
      case 'stock_bajo': return 'warning';
      case 'sobrestock': return 'inventory';
    }
  }
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { IndicadoresService } from '../../core/services/indicadores.service';
import { ProductosService } from '../../core/services/productos.service';
import { RecomendacionesService, Recomendacion } from '../../core/services/recomendaciones.service';
import { Indicadores } from '../../core/models/indicadores.model';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
  private indicadoresService = inject(IndicadoresService);
  private productosService = inject(ProductosService);
  private recomendacionesService = inject(RecomendacionesService);
  private snack = inject(MatSnackBar);

  readonly indicadores = signal<Indicadores | null>(null);
  readonly productos = signal<Producto[]>([]);
  readonly recomendaciones = signal<Recomendacion[]>([]);
  readonly cargando = signal(true);

  readonly criticos = computed(() => this.productos().filter(p => p.estado === 'Stock Crítico' || p.estado === 'Stock Bajo'));
  readonly sobrestock = computed(() => this.productos().filter(p => p.estado === 'Sobrestock'));

  ngOnInit(): void {
    forkJoin({
      indicadores: this.indicadoresService.getIndicadores(),
      productos: this.productosService.getAll(),
      recomendaciones: this.recomendacionesService.getRecomendaciones(),
    }).subscribe(({ indicadores, productos, recomendaciones }) => {
      this.indicadores.set(indicadores);
      this.productos.set(productos);
      this.recomendaciones.set(recomendaciones);
      this.cargando.set(false);
    });
  }

  exportarPdf(): void {
    this.snack.open('Generando reporte PDF... (exportación simulada del prototipo)', 'Cerrar', { duration: 3000 });
  }

  exportarExcel(): void {
    this.snack.open('Generando reporte Excel... (exportación simulada del prototipo)', 'Cerrar', { duration: 3000 });
  }
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { IrisGauge } from '../../shared/components/iris-gauge/iris-gauge';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { IndicadoresService } from '../../core/services/indicadores.service';
import { ProductosService } from '../../core/services/productos.service';
import { OrdenesService } from '../../core/services/ordenes.service';
import { AlertasService } from '../../core/services/alertas.service';
import { Indicadores } from '../../core/models/indicadores.model';
import { Producto } from '../../core/models/producto.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [IrisGauge, KpiCard, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private indicadoresService = inject(IndicadoresService);
  private productosService = inject(ProductosService);
  private ordenesService = inject(OrdenesService);
  private alertasService = inject(AlertasService);

  readonly indicadores = signal<Indicadores | null>(null);
  readonly productos = signal<Producto[]>([]);
  readonly ordenesPendientes = signal(0);
  readonly alertasActivas = signal(0);

  readonly stockCritico = computed(() => this.productos().filter(p => p.estado === 'Stock Crítico').length);

  lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, labels: { font: { family: 'Inter' } } } },
    scales: { y: { beginAtZero: true } },
  };

  barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
  };

  ngOnInit(): void {
    this.indicadoresService.getIndicadores().subscribe(ind => {
      this.indicadores.set(ind);
      this.lineChartData = {
        labels: ind.meses,
        datasets: [
          { data: ind.historicoErp, label: 'Utilización ERP (%)', borderColor: '#123B6D', backgroundColor: 'rgba(18,59,109,0.08)', tension: 0.35, fill: true },
          { data: ind.historicoReposicion, label: 'Reposición (horas)', borderColor: '#E8A33D', backgroundColor: 'rgba(232,163,61,0.08)', tension: 0.35, fill: true },
        ],
      };
    });

    this.productosService.getAll().subscribe(productos => {
      this.productos.set(productos);
      const porCategoria = new Map<string, number>();
      for (const p of productos) {
        porCategoria.set(p.categoria, (porCategoria.get(p.categoria) ?? 0) + p.stockActual);
      }
      this.barChartData = {
        labels: [...porCategoria.keys()],
        datasets: [{ data: [...porCategoria.values()], label: 'Stock actual', backgroundColor: '#2C6FB0', borderRadius: 6 }],
      };
    });

    this.ordenesService.getAll().subscribe(ordenes => {
      this.ordenesPendientes.set(ordenes.filter(o => o.estado !== 'Recibida').length);
    });

    this.alertasService.contarActivas().subscribe(n => this.alertasActivas.set(n));
  }
}

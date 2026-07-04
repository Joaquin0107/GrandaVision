import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
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

  // Paleta de marca (debe coincidir con las variables CSS --gv-primary / --gv-accent)
  private readonly COLOR_PRIMARY: [number, number, number] = [11, 39, 73];   // #0b2749
  private readonly COLOR_ACCENT: [number, number, number] = [232, 163, 61]; // #E8A33D
  private readonly COLOR_MUTED: [number, number, number] = [110, 122, 140];
  private readonly COLOR_CRITICAL: [number, number, number] = [214, 69, 93];

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

  // ---------------------------------------------------------------------
  // Exportación a PDF
  // ---------------------------------------------------------------------
  exportarPdf(): void {
    const ind = this.indicadores();
    if (!ind) {
      this.snack.open('Los datos aún no han cargado, espera un momento.', 'Cerrar', { duration: 3000 });
      return;
    }

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 15;
    let y = 0;

    // --- Encabezado de marca ---
    doc.setFillColor(...this.COLOR_PRIMARY);
    doc.rect(0, 0, pageWidth, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('SmartStock GV', marginX, 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Reporte ejecutivo — Gestión de la Cadena de Suministro', marginX, 19);

    const fecha = new Date().toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' });
    doc.setFontSize(8);
    doc.text(`Generado: ${fecha}`, pageWidth - marginX, 19, { align: 'right' });

    y = 36;

    // --- Indicadores clave ---
    doc.setTextColor(...this.COLOR_PRIMARY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Indicadores clave', marginX, y);
    y += 6;

    const kpis: [string, string][] = [
      ['Tiempo promedio de reposición', `${ind.reposicion}h`],
      ['Disponibilidad de stock', `${ind.disponibilidad}%`],
      ['Utilización del ERP', `${ind.erp}%`],
      ['Índice de sobrestock', `${ind.sobrestock}%`],
    ];

    const kpiBoxWidth = (pageWidth - marginX * 2 - 3 * 4) / 4;
    kpis.forEach(([label, value], i) => {
      const x = marginX + i * (kpiBoxWidth + 4);
      doc.setDrawColor(225, 229, 235);
      doc.setFillColor(248, 249, 251);
      doc.roundedRect(x, y, kpiBoxWidth, 20, 2, 2, 'FD');
      doc.setTextColor(...this.COLOR_MUTED);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      const labelLines = doc.splitTextToSize(label, kpiBoxWidth - 4);
      doc.text(labelLines, x + 3, y + 6);
      doc.setTextColor(...this.COLOR_PRIMARY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text(value, x + 3, y + 16);
    });

    y += 30;

    // --- Tabla genérica para listas de productos ---
    const drawProductTable = (
      title: string,
      items: Producto[],
      columnLabel: string,
      getRef: (p: Producto) => number,
      accentColor: [number, number, number],
    ) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }

      doc.setTextColor(...this.COLOR_PRIMARY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${title} (${items.length})`, marginX, y);
      y += 6;

      if (items.length === 0) {
        doc.setTextColor(...this.COLOR_MUTED);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('Sin registros en esta categoría.', marginX, y);
        y += 10;
        return;
      }

      // Encabezado de tabla
      doc.setFillColor(...this.COLOR_PRIMARY);
      doc.rect(marginX, y, pageWidth - marginX * 2, 7, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('Producto', marginX + 3, y + 5);
      doc.text(columnLabel, pageWidth - marginX - 3, y + 5, { align: 'right' });
      y += 7;

      doc.setFont('helvetica', 'normal');
      items.forEach((p, i) => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        if (i % 2 === 0) {
          doc.setFillColor(248, 249, 251);
          doc.rect(marginX, y, pageWidth - marginX * 2, 7, 'F');
        }
        doc.setTextColor(40, 46, 56);
        doc.setFontSize(9);
        doc.text(p.nombre, marginX + 3, y + 5);
        doc.setTextColor(...accentColor);
        doc.setFont('helvetica', 'bold');
        doc.text(`${p.stockActual}/${getRef(p)}`, pageWidth - marginX - 3, y + 5, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        y += 7;
      });
      y += 8;
    };

    drawProductTable('Productos críticos / bajo stock', this.criticos(), 'Stock (actual/mín)', p => p.stockMinimo, this.COLOR_CRITICAL);
    drawProductTable('Productos con sobrestock', this.sobrestock(), 'Stock (actual/máx)', p => p.stockMaximo, [44, 111, 176]);

    // --- Recomendaciones ---
    const recos = this.recomendaciones();
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(...this.COLOR_PRIMARY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Recomendaciones inteligentes', marginX, y);
    y += 7;

    if (recos.length === 0) {
      doc.setTextColor(...this.COLOR_MUTED);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Sin recomendaciones pendientes por ahora.', marginX, y);
    } else {
      doc.setFontSize(9);
      recos.forEach(r => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        const color = r.tipo === 'comprar' ? this.COLOR_CRITICAL : this.COLOR_PRIMARY;
        doc.setTextColor(...color);
        doc.setFont('helvetica', 'bold');
        doc.text('•', marginX, y + 4);
        doc.text(`${r.productoNombre}:`, marginX + 4, y + 4);
        doc.setTextColor(40, 46, 56);
        doc.setFont('helvetica', 'normal');
        const nombreWidth = doc.getTextWidth(`${r.productoNombre}: `);
        const mensajeLines = doc.splitTextToSize(r.mensaje, pageWidth - marginX * 2 - nombreWidth - 4);
        doc.text(mensajeLines, marginX + 4 + nombreWidth, y + 4);
        y += 6 * mensajeLines.length + 2;
      });
    }

    // --- Pie de página en todas las hojas ---
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(...this.COLOR_MUTED);
      doc.text(`SmartStock GV · Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    const nombreArchivo = `reporte-smartstock-gv-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(nombreArchivo);
    this.snack.open('Reporte PDF generado correctamente.', 'Cerrar', { duration: 3000 });
  }

  // ---------------------------------------------------------------------
  // Exportación a Excel
  // ---------------------------------------------------------------------
  exportarExcel(): void {
    const ind = this.indicadores();
    if (!ind) {
      this.snack.open('Los datos aún no han cargado, espera un momento.', 'Cerrar', { duration: 3000 });
      return;
    }

    const wb = XLSX.utils.book_new();

    // Hoja 1: Indicadores
    const hojaIndicadores = XLSX.utils.json_to_sheet([
      { Indicador: 'Tiempo promedio de reposición', Valor: `${ind.reposicion}h` },
      { Indicador: 'Disponibilidad de stock', Valor: `${ind.disponibilidad}%` },
      { Indicador: 'Utilización del ERP', Valor: `${ind.erp}%` },
      { Indicador: 'Índice de sobrestock', Valor: `${ind.sobrestock}%` },
    ]);
    hojaIndicadores['!cols'] = [{ wch: 32 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, hojaIndicadores, 'Indicadores');

    // Hoja 2: Productos críticos
    const hojaCriticos = XLSX.utils.json_to_sheet(
      this.criticos().map(p => ({
        Producto: p.nombre,
        Estado: p.estado,
        'Stock actual': p.stockActual,
        'Stock mínimo': p.stockMinimo,
      })),
    );
    hojaCriticos['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, hojaCriticos, 'Críticos y bajo stock');

    // Hoja 3: Sobrestock
    const hojaSobrestock = XLSX.utils.json_to_sheet(
      this.sobrestock().map(p => ({
        Producto: p.nombre,
        Estado: p.estado,
        'Stock actual': p.stockActual,
        'Stock máximo': p.stockMaximo,
      })),
    );
    hojaSobrestock['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, hojaSobrestock, 'Sobrestock');

    // Hoja 4: Recomendaciones
    const hojaRecos = XLSX.utils.json_to_sheet(
      this.recomendaciones().map(r => ({
        Producto: r.productoNombre,
        Tipo: r.tipo === 'comprar' ? 'Comprar' : 'No comprar',
        Mensaje: r.mensaje,
      })),
    );
    hojaRecos['!cols'] = [{ wch: 30 }, { wch: 14 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, hojaRecos, 'Recomendaciones');

    const nombreArchivo = `reporte-smartstock-gv-${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);
    this.snack.open('Reporte Excel generado correctamente.', 'Cerrar', { duration: 3000 });
  }
}
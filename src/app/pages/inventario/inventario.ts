import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductosService } from '../../core/services/productos.service';
import { Producto, EstadoProducto } from '../../core/models/producto.model';
import { ProductoDialog, ProductoDialogData } from './producto-dialog/producto-dialog';

const COLUMNS = ['codigo', 'nombre', 'categoria', 'proveedor', 'stockActual', 'precio', 'estado', 'acciones'];

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss',
})
export class Inventario implements OnInit {
  private productosService = inject(ProductosService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly columnas = COLUMNS;
  readonly dataSource = new MatTableDataSource<Producto>([]);
  readonly categorias = signal<string[]>([]);
  readonly cargando = signal(true);

  readonly filtroCategoria = signal<string>('');
  readonly filtroEstado = signal<EstadoProducto | ''>('');

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.productosService.getAll().subscribe(productos => {
      this.dataSource.data = productos;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.cargando.set(false);
    });
    this.productosService.getCategorias().subscribe(cats => this.categorias.set(cats));
  }

  aplicarFiltros(textoBusqueda: string): void {
    const filtro = {
      texto: textoBusqueda.trim().toLowerCase(),
      categoria: this.filtroCategoria(),
      estado: this.filtroEstado(),
    };

    this.dataSource.filterPredicate = (producto, filtroJson) => {
      const f = JSON.parse(filtroJson) as typeof filtro;
      const coincideTexto = !f.texto || producto.nombre.toLowerCase().includes(f.texto) || producto.codigo.toLowerCase().includes(f.texto);
      const coincideCategoria = !f.categoria || producto.categoria === f.categoria;
      const coincideEstado = !f.estado || producto.estado === f.estado;
      return coincideTexto && coincideCategoria && coincideEstado;
    };
    this.dataSource.filter = JSON.stringify(filtro);
  }

  onBuscar(valor: string): void {
    this.aplicarFiltros(valor);
  }

  onFiltroCategoria(valor: string): void {
    this.filtroCategoria.set(valor);
    this.aplicarFiltros('');
  }

  onFiltroEstado(valor: EstadoProducto | ''): void {
    this.filtroEstado.set(valor);
    this.aplicarFiltros('');
  }

  chipClase(estado: EstadoProducto): string {
    switch (estado) {
      case 'Disponible': return 'gv-chip gv-chip--disponible';
      case 'Stock Bajo': return 'gv-chip gv-chip--bajo';
      case 'Stock Crítico': return 'gv-chip gv-chip--critico';
      case 'Sobrestock': return 'gv-chip gv-chip--sobrestock';
    }
  }

  abrirNuevo(): void {
    const data: ProductoDialogData = { categorias: this.categorias() };
    const ref = this.dialog.open(ProductoDialog, { data, width: '520px' });
    ref.afterClosed().subscribe(resultado => {
      if (!resultado) return;
      this.productosService.create(resultado).subscribe(() => {
        this.snack.open('Producto registrado correctamente.', 'Cerrar', { duration: 2500 });
        this.cargar();
      });
    });
  }

  abrirEditar(producto: Producto): void {
    const data: ProductoDialogData = { producto, categorias: this.categorias() };
    const ref = this.dialog.open(ProductoDialog, { data, width: '520px' });
    ref.afterClosed().subscribe(resultado => {
      if (!resultado) return;
      this.productosService.update(producto.id, resultado).subscribe(() => {
        this.snack.open('Producto actualizado correctamente.', 'Cerrar', { duration: 2500 });
        this.cargar();
      });
    });
  }

  eliminar(producto: Producto): void {
    if (!confirm(`¿Eliminar "${producto.nombre}" del inventario?`)) return;
    this.productosService.delete(producto.id).subscribe(() => {
      this.snack.open('Producto eliminado.', 'Cerrar', { duration: 2500 });
      this.cargar();
    });
  }
}

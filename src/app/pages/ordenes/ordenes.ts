import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { OrdenesService } from '../../core/services/ordenes.service';
import { ProductosService } from '../../core/services/productos.service';
import { ProveedoresService } from '../../core/services/proveedores.service';
import { OrdenCompra, EstadoOrden } from '../../core/models/orden.model';
import { Producto } from '../../core/models/producto.model';
import { Proveedor } from '../../core/models/proveedor.model';
import { OrdenDialog, OrdenDialogData } from './orden-dialog/orden-dialog';
import { forkJoin } from 'rxjs';

const COLUMNS = ['numeroOrden', 'proveedor', 'items', 'fecha', 'estado', 'acciones'];

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatButtonModule, MatDialogModule, MatTooltipModule],
  templateUrl: './ordenes.html',
  styleUrl: './ordenes.scss',
})
export class Ordenes implements OnInit {
  private ordenesService = inject(OrdenesService);
  private productosService = inject(ProductosService);
  private proveedoresService = inject(ProveedoresService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  readonly columnas = COLUMNS;
  readonly ordenes = signal<OrdenCompra[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly proveedores = signal<Proveedor[]>([]);
  readonly cargando = signal(true);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    forkJoin({
      ordenes: this.ordenesService.getAll(),
      productos: this.productosService.getAll(),
      proveedores: this.proveedoresService.getAll(),
    }).subscribe(({ ordenes, productos, proveedores }) => {
      this.ordenes.set([...ordenes].sort((a, b) => (a.fecha < b.fecha ? 1 : -1)));
      this.productos.set(productos);
      this.proveedores.set(proveedores);
      this.cargando.set(false);
    });
  }

  chipClase(estado: EstadoOrden): string {
    switch (estado) {
      case 'Pendiente': return 'gv-chip gv-chip--pendiente';
      case 'En proceso': return 'gv-chip gv-chip--proceso';
      case 'Recibida': return 'gv-chip gv-chip--recibida';
    }
  }

  abrirNueva(): void {
    this.ordenesService.siguienteNumeroOrden().subscribe(siguienteNumero => {
      const data: OrdenDialogData = { productos: this.productos(), proveedores: this.proveedores(), siguienteNumero };
      const ref = this.dialog.open(OrdenDialog, { data, width: '520px' });
      ref.afterClosed().subscribe(resultado => {
        if (!resultado) return;
        this.ordenesService.create(resultado).subscribe(() => {
          this.snack.open('Orden de compra registrada.', 'Cerrar', { duration: 2500 });
          this.cargar();
        });
      });
    });
  }

  abrirEditar(orden: OrdenCompra): void {
    const data: OrdenDialogData = { orden, productos: this.productos(), proveedores: this.proveedores(), siguienteNumero: orden.numeroOrden };
    const ref = this.dialog.open(OrdenDialog, { data, width: '520px' });
    ref.afterClosed().subscribe(resultado => {
      if (!resultado) return;
      this.ordenesService.update(orden.id, resultado).subscribe(() => {
        this.snack.open('Orden actualizada.', 'Cerrar', { duration: 2500 });
        this.cargar();
      });
    });
  }

  eliminar(orden: OrdenCompra): void {
    if (!confirm(`¿Eliminar la orden ${orden.numeroOrden}?`)) return;
    this.ordenesService.delete(orden.id).subscribe(() => {
      this.snack.open('Orden eliminada.', 'Cerrar', { duration: 2500 });
      this.cargar();
    });
  }
}

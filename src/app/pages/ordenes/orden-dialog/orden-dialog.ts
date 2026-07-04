import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { OrdenCompra } from '../../../core/models/orden.model';
import { Producto } from '../../../core/models/producto.model';
import { Proveedor } from '../../../core/models/proveedor.model';

export interface OrdenDialogData {
  orden?: OrdenCompra;
  productos: Producto[];
  proveedores: Proveedor[];
  siguienteNumero: string;
}

@Component({
  selector: 'app-orden-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './orden-dialog.html',
})
export class OrdenDialog {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<OrdenDialog>);
  data = inject<OrdenDialogData>(MAT_DIALOG_DATA);

  esEdicion = !!this.data.orden;

  form = this.fb.nonNullable.group({
    numeroOrden: [this.data.orden?.numeroOrden ?? this.data.siguienteNumero, Validators.required],
    proveedor: [this.data.orden?.proveedor ?? '', Validators.required],
    productoId: [this.data.orden?.items[0]?.productoId ?? null as number | null, Validators.required],
    cantidad: [this.data.orden?.items[0]?.cantidad ?? 1, [Validators.required, Validators.min(1)]],
    fecha: [this.data.orden ? new Date(this.data.orden.fecha) : new Date(), Validators.required],
    estado: [this.data.orden?.estado ?? 'Pendiente', Validators.required],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const producto = this.data.productos.find(p => p.id === v.productoId);

    this.ref.close({
      numeroOrden: v.numeroOrden,
      proveedor: v.proveedor,
      items: [{ productoId: v.productoId, productoNombre: producto?.nombre ?? '', cantidad: v.cantidad }],
      fecha: (v.fecha as Date).toISOString().slice(0, 10),
      estado: v.estado,
    });
  }

  cancelar(): void {
    this.ref.close();
  }
}

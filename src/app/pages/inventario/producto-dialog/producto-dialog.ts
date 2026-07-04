import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { Producto } from '../../../core/models/producto.model';

export interface ProductoDialogData {
  producto?: Producto;
  categorias: string[];
}

@Component({
  selector: 'app-producto-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './producto-dialog.html',
})
export class ProductoDialog {
  private fb = inject(FormBuilder);
  private ref = inject(MatDialogRef<ProductoDialog>);
  data = inject<ProductoDialogData>(MAT_DIALOG_DATA);

  esEdicion = !!this.data.producto;

  form = this.fb.nonNullable.group({
    codigo: [this.data.producto?.codigo ?? '', Validators.required],
    nombre: [this.data.producto?.nombre ?? '', Validators.required],
    categoria: [this.data.producto?.categoria ?? '', Validators.required],
    proveedor: [this.data.producto?.proveedor ?? '', Validators.required],
    stockActual: [this.data.producto?.stockActual ?? 0, [Validators.required, Validators.min(0)]],
    stockMinimo: [this.data.producto?.stockMinimo ?? 0, [Validators.required, Validators.min(0)]],
    stockMaximo: [this.data.producto?.stockMaximo ?? 0, [Validators.required, Validators.min(0)]],
    precio: [this.data.producto?.precio ?? 0, [Validators.required, Validators.min(0)]],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ref.close(this.form.getRawValue());
  }

  cancelar(): void {
    this.ref.close();
  }
}

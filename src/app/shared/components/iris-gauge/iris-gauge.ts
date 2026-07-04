import { Component, computed, input } from '@angular/core';

/**
 * IrisGauge — elemento de firma visual de SmartStock GV.
 * Un anillo tipo "apertura de lente" que representa un % (0-100),
 * evocando el sector óptico de Granda Visión sin recurrir a un
 * gráfico de barra genérico.
 */
@Component({
  selector: 'app-iris-gauge',
  standalone: true,
  templateUrl: './iris-gauge.html',
  styleUrl: './iris-gauge.scss',
})
export class IrisGauge {
  value = input.required<number>(); // 0-100
  color = input<string>('var(--gv-primary-light)');
  size = input<number>(84);

  private readonly radius = 34;
  readonly circumference = 2 * Math.PI * this.radius;

  readonly dashoffset = computed(() => {
    const v = Math.max(0, Math.min(100, this.value()));
    return this.circumference - (v / 100) * this.circumference;
  });
}

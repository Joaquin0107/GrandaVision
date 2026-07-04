import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
})
export class KpiCard {
  icon = input.required<string>();
  label = input.required<string>();
  value = input.required<string | number>();
  tone = input<'primary' | 'accent' | 'critical' | 'success'>('primary');
}

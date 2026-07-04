import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/services/auth.service';
import { AlertasService } from '../../core/services/alertas.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatIconModule, MatMenuModule, MatBadgeModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private auth = inject(AuthService);
  private alertasService = inject(AlertasService);
  private router = inject(Router);

  readonly sesion = this.auth.sesion;
  readonly sidebarAbierto = signal(true);
  readonly alertasActivas = signal(0);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Inventario', icon: 'inventory_2', route: '/inventario' },
    { label: 'Alertas', icon: 'notifications_active', route: '/alertas' },
    { label: 'Órdenes de Compra', icon: 'shopping_cart', route: '/ordenes' },
    { label: 'Reportes', icon: 'bar_chart', route: '/reportes' },
    { label: 'Configuración', icon: 'settings', route: '/configuracion' },
  ];

  constructor() {
    this.refrescarAlertas();
  }

  refrescarAlertas(): void {
    this.alertasService.contarActivas().subscribe(n => this.alertasActivas.set(n));
  }

  toggleSidebar(): void {
    this.sidebarAbierto.set(!this.sidebarAbierto());
  }

  cerrarSesion(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

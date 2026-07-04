import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'inventario', loadComponent: () => import('./pages/inventario/inventario').then(m => m.Inventario) },
      { path: 'alertas', loadComponent: () => import('./pages/alertas/alertas').then(m => m.Alertas) },
      { path: 'ordenes', loadComponent: () => import('./pages/ordenes/ordenes').then(m => m.Ordenes) },
      { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes').then(m => m.Reportes) },
      { path: 'configuracion', loadComponent: () => import('./pages/configuracion/configuracion').then(m => m.Configuracion) },
    ],
  },
  { path: '**', redirectTo: 'login' },
];

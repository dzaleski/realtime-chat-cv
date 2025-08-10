import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component'),
    loadChildren: () => import('./home/home.routes'),
    canActivate: [isAuthenticatedGuard],
    canActivateChild: [isAuthenticatedGuard],
  },
  { path: '**', pathMatch: 'full', redirectTo: 'auth' },
];

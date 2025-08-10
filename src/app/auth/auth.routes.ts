import { Route } from '@angular/router';

const AUTH_ROUTES: Route[] = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component'),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component'),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
];

export default AUTH_ROUTES;

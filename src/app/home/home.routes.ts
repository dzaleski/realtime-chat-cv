import { Route } from '@angular/router';

const homeRoutes: Route[] = [
  {
    path: 'chats',
    loadComponent: () => import('./chats/chats.component'),
  },
  {
    path: 'invitations',
    loadComponent: () => import('./invitations/invitations.component'),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component'),
  },
  {
    path: '',
    redirectTo: 'chats',
    pathMatch: 'full',
  },
];

export default homeRoutes;

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/gerencia-portal/gerencia-portal.component.js').then(
        (m) => m.GerenciaPortalComponent,
      ),
  },
  {
    path: 'gerencia',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];


import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/pwa-standalone/pwa-standalone.component.js').then(
        (m) => m.PwaStandaloneComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];


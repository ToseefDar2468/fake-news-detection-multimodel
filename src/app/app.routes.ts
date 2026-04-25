import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'analysis',
  },
  {
    path: 'analysis',
    title: 'Analysis | Explainable Multimodal Fake News Detection',
    loadComponent: () =>
      import('./features/analysis/analysis-page.component').then(
        (module) => module.AnalysisPageComponent,
      ),
  },
  {
    path: 'history',
    title: 'History | Explainable Multimodal Fake News Detection',
    loadComponent: () =>
      import('./features/history/history-page.component').then(
        (module) => module.HistoryPageComponent,
      ),
  },
  {
    path: 'about',
    title: 'About | Explainable Multimodal Fake News Detection',
    loadComponent: () =>
      import('./features/about/about-page.component').then((module) => module.AboutPageComponent),
  },
  {
    path: '**',
    redirectTo: 'analysis',
  },
];

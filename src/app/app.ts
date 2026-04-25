import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly exact?: boolean;
}

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly navigationItems: readonly NavigationItem[] = [
    {
      label: 'Analysis',
      path: '/analysis',
      exact: true,
    },
    {
      label: 'History',
      path: '/history',
    },
    {
      label: 'About',
      path: '/about',
    },
  ];
}

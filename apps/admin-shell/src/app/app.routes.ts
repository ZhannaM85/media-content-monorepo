import { Route } from '@angular/router';
import { authGuard } from '@media-content/shared-auth';

export const appRoutes: Route[] = [
    {
        path: 'login',
        loadComponent: () =>
            import('./login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'content',
        loadChildren: () =>
            import('contentapp/Routes').then((m) => m!.remoteRoutes),
        canActivate: [authGuard],
    },
    {
        path: 'rights',
        loadChildren: () =>
            import('rightsapp/Routes').then((m) => m!.remoteRoutes),
        canActivate: [authGuard],
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'content',
    },
];

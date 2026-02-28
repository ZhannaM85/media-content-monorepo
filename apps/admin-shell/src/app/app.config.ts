import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { authInterceptor } from '@media-content/shared-auth';
import { TMDB_API_BASE, TMDB_API_KEY } from '@media-content/shared-data-access';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(appRoutes),
        provideHttpClient(withInterceptors([authInterceptor])),
        { provide: TMDB_API_KEY, useValue: environment.tmdbApiKey },
        { provide: TMDB_API_BASE, useValue: 'https://api.themoviedb.org/3' },
    ],
};

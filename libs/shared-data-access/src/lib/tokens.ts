import { InjectionToken } from '@angular/core';

export const TMDB_API_BASE = new InjectionToken<string>('TMDB API base URL', {
    providedIn: 'root',
    factory: () => 'https://api.themoviedb.org/3',
});

export const TMDB_API_KEY = new InjectionToken<string>('TMDB API key', {
    providedIn: 'root',
    factory: () => '',
});

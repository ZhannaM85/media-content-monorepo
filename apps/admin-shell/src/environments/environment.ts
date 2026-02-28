/** TMDB key is injected from .env via scripts/inject-env.js (run before serve/build). */
import { env } from './environment.generated';

export const environment = {
    tmdbApiKey: env.NX_TMDB_API_KEY,
};

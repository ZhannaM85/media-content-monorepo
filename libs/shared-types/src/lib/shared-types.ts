/**
 * Role for RBAC
 */
export type Role = 'admin' | 'editor' | 'viewer';

/**
 * Region for rights assignment
 */
export type Region = 'US' | 'EU' | 'APAC';

/**
 * User model (from auth)
 */
export interface User {
  id: string;
  username: string;
  role: Role;
}

/**
 * Content item (movie from TMDB or local draft)
 */
export interface Content {
  id: number | string;
  title: string;
  overview?: string;
  posterPath?: string;
  releaseDate?: string;
  voteAverage?: number;
  status?: 'draft' | 'published';
}

/**
 * Rights assignment for content
 */
export interface Rights {
  id: string;
  contentId: number | string;
  regions: Region[];
  expirationDate: string;
  gdprAcknowledged?: boolean;
}

/**
 * TMDB discover movie response item (raw API shape)
 */
export interface TmdbMovieResult {
  id: number;
  title: string;
  overview: string | null;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number;
  [key: string]: unknown;
}

/**
 * TMDB paginated response
 */
export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

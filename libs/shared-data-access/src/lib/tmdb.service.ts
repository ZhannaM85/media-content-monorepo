import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import type { Content, TmdbMovieResult, TmdbPaginatedResponse } from '@media-content/shared-types';
import { TMDB_API_BASE, TMDB_API_KEY } from './tokens';

export interface DiscoverMoviesParams {
  page?: number;
  sortBy?: string;
  withGenre?: number;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'vote_average.gte'?: number;
}

@Injectable({ providedIn: 'root' })
export class TmdbService {
  constructor(
    private readonly http: HttpClient,
    @Inject(TMDB_API_BASE) private readonly baseUrl: string,
    @Inject(TMDB_API_KEY) private readonly apiKey: string
  ) {}

  discoverMovies(params: DiscoverMoviesParams = {}): Observable<{
    page: number;
    totalPages: number;
    totalResults: number;
    results: Content[];
  }> {
    let httpParams = new HttpParams().set('api_key', this.apiKey);
    if (params.page != null) httpParams = httpParams.set('page', params.page);
    if (params.sortBy) httpParams = httpParams.set('sort_by', params.sortBy);
    if (params.withGenre != null) httpParams = httpParams.set('with_genres', params.withGenre);
    if (params['primary_release_date.gte']) httpParams = httpParams.set('primary_release_date.gte', params['primary_release_date.gte']);
    if (params['primary_release_date.lte']) httpParams = httpParams.set('primary_release_date.lte', params['primary_release_date.lte']);
    if (params['vote_average.gte'] != null) httpParams = httpParams.set('vote_average.gte', params['vote_average.gte']);

    return this.http
      .get<TmdbPaginatedResponse<TmdbMovieResult>>(`${this.baseUrl}/discover/movie`, { params: httpParams })
      .pipe(
        map((res) => ({
          page: res.page,
          totalPages: res.total_pages,
          totalResults: res.total_results,
          results: res.results.map((m) => this.mapMovieToContent(m)),
        }))
      );
  }

  getMovie(id: number): Observable<Content> {
    return this.http
      .get<TmdbMovieResult>(`${this.baseUrl}/movie/${id}`, {
        params: { api_key: this.apiKey },
      })
      .pipe(map((m) => this.mapMovieToContent(m)));
  }

  private mapMovieToContent(m: TmdbMovieResult): Content {
    return {
      id: m.id,
      title: m.title,
      overview: m.overview ?? undefined,
      posterPath: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : undefined,
      releaseDate: m.release_date ?? undefined,
      voteAverage: m.vote_average,
    };
  }
}

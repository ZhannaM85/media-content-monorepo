import { DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    map,
    switchMap,
    throttleTime,
} from 'rxjs/operators';
import { TmdbService } from '@media-content/shared-data-access';
import type { Content } from '@media-content/shared-types';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_THROTTLE_MS = 300;
const SEARCH_MIN_CHARS = 3;

export type SearchRequest = { term: string; page: number; append: boolean } | null;

/**
 * Handles content search: input stream, debounce/throttle, and TMDB search API.
 * Exposes search results and loading state for the content list.
 */
@Injectable({ providedIn: 'root' })
export class ContentSearchService {
    private readonly tmdb = inject(TmdbService);
    private readonly destroyRef = inject(DestroyRef);

    /** Raw search input (bound to the input field). */
    readonly searchQuery = signal('');
    private readonly searchInput$ = new BehaviorSubject<string>('');
    private readonly searchRequest$ = new Subject<SearchRequest>();

    /** Effective search term (debounced/throttled). */
    readonly searchTerm = toSignal(
        this.searchInput$.pipe(
            throttleTime(SEARCH_THROTTLE_MS),
            debounceTime(SEARCH_DEBOUNCE_MS),
            distinctUntilChanged()
        ),
        { initialValue: '' }
    );

    readonly searchResults = signal<Content[]>([]);
    readonly searchTotalPages = signal(0);
    readonly searchCurrentPage = signal(1);
    readonly loading = signal(false);
    readonly loadingBlocking = signal(false);

    readonly searchMinChars = SEARCH_MIN_CHARS;

    constructor() {
        this.searchRequest$
            .pipe(
                switchMap((request) => {
                    if (!request) {
                        this.loading.set(false);
                        this.loadingBlocking.set(false);
                        return EMPTY;
                    }
                    this.loading.set(true);
                    if (request.page === 1) {
                        this.loadingBlocking.set(true);
                    }
                    return this.tmdb.searchMovies(request.term, request.page).pipe(
                        catchError(() => {
                            this.loading.set(false);
                            if (request.page === 1) {
                                this.loadingBlocking.set(false);
                            }
                            return EMPTY;
                        }),
                        map((res) => ({
                            res,
                            page: request.page,
                            append: request.append,
                        }))
                    );
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(({ res, page, append }) => {
                if (append) {
                    this.searchResults.update((prev) => [...prev, ...res.results]);
                } else {
                    this.searchResults.set(res.results);
                }
                this.searchTotalPages.set(res.totalPages);
                this.searchCurrentPage.set(res.page);
                this.loading.set(false);
                if (page === 1) {
                    this.loadingBlocking.set(false);
                }
            });

        effect(() => {
            const term = (this.searchTerm() ?? '').trim();
            if (term.length >= SEARCH_MIN_CHARS) {
                this.requestSearch({ term, page: 1, append: false });
            } else {
                this.requestSearch(null);
                this.searchResults.set([]);
                this.searchTotalPages.set(0);
                this.searchCurrentPage.set(0);
            }
        });
    }

    setSearchInput(value: string): void {
        this.searchQuery.set(value);
        this.searchInput$.next(value);
    }

    requestSearch(request: SearchRequest): void {
        this.searchRequest$.next(request);
    }

    /** Load next page of search results (infinite scroll). */
    loadMoreSearch(): void {
        const term = (this.searchTerm() ?? '').trim();
        if (term.length < SEARCH_MIN_CHARS) return;
        const current = this.searchCurrentPage();
        const total = this.searchTotalPages();
        if (current >= total || this.loading()) return;
        this.requestSearch({
            term,
            page: current + 1,
            append: true,
        });
    }

    isSearchActive(): boolean {
        return (this.searchQuery() ?? '').trim().length >= SEARCH_MIN_CHARS;
    }
}

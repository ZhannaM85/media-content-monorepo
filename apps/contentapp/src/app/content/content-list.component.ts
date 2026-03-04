import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal,
    computed,
    effect,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, throttleTime } from 'rxjs/operators';
import {
    TmdbService,
    RightsStoreService,
} from '@media-content/shared-data-access';
import { PaginationComponent } from '@media-content/shared-ui';
import type { Content, Rights } from '@media-content/shared-types';
import { HasRoleDirective } from '@media-content/shared-auth';
import { ContentDraftService } from './content-draft.service';

/** Row height in px for CDK virtual scroll (must match CSS .content-viewport .lib-table tbody tr height) */
const ROW_HEIGHT_PX = 80;

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_THROTTLE_MS = 300;
const SEARCH_MIN_CHARS = 3;
type SearchRequest = { term: string; page: number; append: boolean } | null;

@Component({
    selector: 'app-content-list',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterLink,
        FormsModule,
        ScrollingModule,
        PaginationComponent,
        HasRoleDirective,
    ],
    templateUrl: './content-list.component.html',
    styleUrl: './content-list.component.scss',
})
export class ContentListComponent {
    private readonly tmdb = inject(TmdbService);
    private readonly draftService = inject(ContentDraftService);
    private readonly rightsStore = inject(RightsStoreService);
    private readonly destroyRef = inject(DestroyRef);

    private rightsList = toSignal(this.rightsStore.getRights(), {
        initialValue: [] as Rights[],
    });
    private contentIdsWithRights = computed(() =>
        new Set(
            (this.rightsList() ?? []).map((r) => String(r.contentId)),
        ),
    );

    filterStatus = signal<'all' | 'tmdb' | 'draft'>('all');
    currentPage = signal(1);
    loading = signal(false);
    /** True when waiting for an API response that replaces the main list (filter, search, initial load, sort). Full-page spinner shows. */
    loadingBlocking = signal(false);
    totalPages = signal(0);
    private tmdbResults = signal<Content[]>([]);
    readonly rowHeightPx = ROW_HEIGHT_PX;

    columns: { key: string; label: string; align?: 'left' | 'center' | 'right' }[] = [
        { key: 'poster', label: '' },
        { key: 'title', label: 'Title', align: 'left' },
        { key: 'id', label: 'ID', align: 'center' },
        { key: 'releaseDate', label: 'Release date', align: 'center' },
        { key: 'voteAverage', label: 'Rating', align: 'center' },
        { key: 'actions', label: 'Actions', align: 'center' },
    ];

    /** Sortable column keys (ID excluded – not supported by TMDB discover API) */
    readonly sortableColumns = new Set(['title', 'releaseDate', 'voteAverage']);

    /** Columns that support server-side sort via TMDB discover sort_by. ID has no API sort. */
    private readonly serverSortColumns = new Set([
        'title',
        'releaseDate',
        'voteAverage',
    ]);

    sortColumn = signal<string | null>(null);
    sortDirection = signal<'asc' | 'desc'>('asc');

    /** TMDB sort_by value for discover API (e.g. title.asc, release_date.desc). Undefined for id. */
    private getDiscoverSortBy(): string {
        const col = this.sortColumn();
        const dir = this.sortDirection();
        if (!col || !this.serverSortColumns.has(col)) return 'popularity.desc';
        const suffix = dir === 'asc' ? 'asc' : 'desc';
        const tmdbKey =
            col === 'releaseDate'
                ? 'release_date'
                : col === 'voteAverage'
                  ? 'vote_average'
                  : 'title';
        return `${tmdbKey}.${suffix}`;
    }

    /** Raw search input (bound to the input field) */
    searchQuery = signal('');
    /** Search term stream: throttle + debounce for user typing. */
    private readonly searchInput$ = new BehaviorSubject<string>('');
    private readonly searchRequest$ = new Subject<SearchRequest>();
    /** Effective search term (debounced/throttled, min 3 chars or empty) */
    readonly searchTerm = toSignal(
        this.searchInput$.pipe(
            throttleTime(SEARCH_THROTTLE_MS),
            debounceTime(SEARCH_DEBOUNCE_MS),
            distinctUntilChanged()
        ),
        { initialValue: '' }
    );

    /** Results from API search (when user has typed 3+ chars). Empty when not searching. */
    private searchResults = signal<Content[]>([]);
    private searchTotalPages = signal(0);
    private searchCurrentPage = signal(1);

    /** Base list: discover + drafts, or filter by tmdb/draft. */
    private baseList = computed(() => {
        const filter = this.filterStatus();
        const tmdb = this.tmdbResults();
        const drafts = this.draftService.drafts();
        if (filter === 'tmdb') return tmdb;
        if (filter === 'draft') return drafts;
        return [...drafts, ...tmdb];
    });

    /** True when search is active (user typed 3+ chars and we show API search results). */
    private isSearchActive = computed(
        () => (this.searchQuery() ?? '').trim().length >= SEARCH_MIN_CHARS
    );

    /** List to display: API search results when searching, otherwise base list. */
    list = computed(() =>
        this.isSearchActive() ? this.searchResults() : this.baseList()
    );

    /** When true, list is already sorted by API (discover with title/releaseDate/voteAverage). */
    private isServerSorted = computed(() => {
        const col = this.sortColumn();
        return (
            !this.isSearchActive() &&
            this.filterStatus() !== 'draft' &&
            col != null &&
            this.serverSortColumns.has(col)
        );
    });

    sortedList = computed(() => {
        const items = this.list();
        if (this.isServerSorted()) return items;
        const col = this.sortColumn();
        const dir = this.sortDirection();
        if (!col || !this.sortableColumns.has(col)) return items;
        const asc = dir === 'asc';
        return [...items].sort((a, b) => {
            const aVal = a[col as keyof Content];
            const bVal = b[col as keyof Content];
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return asc ? 1 : -1;
            if (bVal == null) return asc ? -1 : 1;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return asc
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return asc ? aVal - bVal : bVal - aVal;
            }
            return String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        });
    });

    getSortAriaLabel(columnKey: string, columnLabel: string): string {
        if (this.sortColumn() !== columnKey) {
            return `Sort by ${columnLabel} ascending`;
        }
        return this.sortDirection() === 'asc'
            ? `Sorted by ${columnLabel} ascending. Activate to sort descending`
            : `Sorted by ${columnLabel} descending. Activate to clear sorting`;
    }

    getAriaSort(columnKey: string): 'none' | 'ascending' | 'descending' {
        if (this.sortColumn() !== columnKey) return 'none';
        return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
    }

    setSort(columnKey: string): void {
        if (!this.sortableColumns.has(columnKey)) return;
        const current = this.sortColumn();
        const dir = this.sortDirection();
        if (current === columnKey) {
            if (dir === 'asc') {
                this.sortDirection.set('desc');
            } else {
                this.sortColumn.set(null);
            }
        } else {
            this.sortColumn.set(columnKey);
            this.sortDirection.set('asc');
        }
        const needsReload =
            !this.isSearchActive() &&
            this.filterStatus() !== 'draft' &&
            (this.serverSortColumns.has(columnKey) || current === columnKey);
        if (needsReload) {
            this.currentPage.set(1);
            this.loadPage();
        }
    }

    onSearchChange(value: string): void {
        this.searchQuery.set(value);
        this.searchInput$.next(value);
    }

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
                        // Keep request metadata after switchMap for list update strategy.
                        map((res) => ({
                            res,
                            page: request.page,
                            append: request.append,
                        })),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
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

        this.loadPage();
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

    private requestSearch(request: SearchRequest): void {
        this.searchRequest$.next(request);
    }

    /** Load next page of search results (infinite scroll in search mode). */
    private loadMoreSearch(): void {
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

    trackById(_index: number, item: Content): number | string {
        return item.id;
    }

    hasRights(contentId: number | string): boolean {
        return this.contentIdsWithRights().has(String(contentId));
    }

    onFilterChange(v: string) {
        this.filterStatus.set(v as 'all' | 'tmdb' | 'draft');
        if (v !== 'draft') this.loadPage();
    }

    goToPage(page: number) {
        this.currentPage.set(page);
        this.loadPage();
    }

    /** Called when user scrolls near the end of the list – load next page (discover or search). */
    onScrolledIndexChange(firstVisibleIndex: number): void {
        if (this.loading()) return;
        const listLength = this.sortedList().length;
        const loadMoreThreshold = 8;
        if (listLength === 0 || firstVisibleIndex < listLength - loadMoreThreshold) {
            return;
        }
        if (this.isSearchActive()) {
            this.loadMoreSearch();
        } else {
            if (this.filterStatus() === 'draft') return;
            if (this.currentPage() >= this.totalPages()) return;
            this.loadMore();
        }
    }

    /** Load next page from TMDB and append to current results (infinite scroll) */
    private loadMore(): void {
        if (this.filterStatus() === 'draft') return;
        if (this.currentPage() >= this.totalPages()) return;
        if (this.loading()) return;
        const nextPage = this.currentPage() + 1;
        this.loading.set(true);
        this.tmdb
            .discoverMovies({
                page: nextPage,
                sortBy: this.getDiscoverSortBy(),
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.tmdbResults.set([...this.tmdbResults(), ...res.results]);
                    this.totalPages.set(res.totalPages);
                    this.currentPage.set(nextPage);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false),
            });
    }

    private loadPage() {
        if (this.filterStatus() === 'draft') return;
        this.loading.set(true);
        this.loadingBlocking.set(true);
        this.tmdb
            .discoverMovies({
                page: this.currentPage(),
                sortBy: this.getDiscoverSortBy(),
            })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res) => {
                    this.tmdbResults.set(res.results);
                    this.totalPages.set(res.totalPages);
                    this.loading.set(false);
                    this.loadingBlocking.set(false);
                },
                error: () => {
                    this.loading.set(false);
                    this.loadingBlocking.set(false);
                },
            });
    }
}

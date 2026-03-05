import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal,
    computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TmdbService, RightsStoreService } from '@media-content/shared-data-access';
import { PaginationComponent } from '@media-content/shared-ui';
import type { Content, Rights } from '@media-content/shared-types';
import { HasRoleDirective } from '@media-content/shared-auth';
import { ContentDraftService } from './content-draft.service';
import { ContentSearchService } from './content-search.service';
import { ContentSortPipe } from './content-sort.pipe';

/** Row height in px for CDK virtual scroll (must match CSS .content-viewport .lib-table tbody tr height) */
const ROW_HEIGHT_PX = 80;

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
    private readonly searchService = inject(ContentSearchService);
    private readonly contentSortPipe = inject(ContentSortPipe);

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
    private discoverLoading = signal(false);
    private discoverLoadingBlocking = signal(false);
    totalPages = signal(0);
    private tmdbResults = signal<Content[]>([]);
    readonly rowHeightPx = ROW_HEIGHT_PX;

    /** Combined loading state for template (discover + search). */
    loadingBlocking = computed(
        () => this.discoverLoadingBlocking() || this.searchService.loadingBlocking()
    );
    loading = computed(
        () => this.discoverLoading() || this.searchService.loading()
    );

    columns: { key: string; label: string; align?: 'left' | 'center' | 'right' }[] = [
        { key: 'poster', label: '' },
        { key: 'title', label: 'Title', align: 'left' },
        { key: 'id', label: 'ID', align: 'center' },
        { key: 'releaseDate', label: 'Release date', align: 'center' },
        { key: 'voteAverage', label: 'Rating', align: 'center' },
        { key: 'actions', label: 'Actions', align: 'center' },
    ];

    readonly sortableColumns = new Set(['title', 'releaseDate', 'voteAverage']);
    private readonly serverSortColumns = new Set([
        'title',
        'releaseDate',
        'voteAverage',
    ]);

    sortColumn = signal<string | null>(null);
    sortDirection = signal<'asc' | 'desc'>('asc');

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

    searchQuery = this.searchService.searchQuery;

    private baseList = computed(() => {
        const filter = this.filterStatus();
        const tmdb = this.tmdbResults();
        const drafts = this.draftService.drafts();
        if (filter === 'tmdb') return tmdb;
        if (filter === 'draft') return drafts;
        return [...drafts, ...tmdb];
    });

    private isSearchActive = computed(() => this.searchService.isSearchActive());

    list = computed(() =>
        this.isSearchActive()
            ? this.searchService.searchResults()
            : this.baseList()
    );

    private isServerSorted = computed(() => {
        const col = this.sortColumn();
        return (
            !this.isSearchActive() &&
            this.filterStatus() !== 'draft' &&
            col != null &&
            this.serverSortColumns.has(col)
        );
    });

    sortedList = computed(() =>
        this.contentSortPipe.transform(
            this.list(),
            this.sortColumn(),
            this.sortDirection(),
            this.isServerSorted()
        )
    );

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
        this.searchService.setSearchInput(value);
    }

    constructor() {
        this.loadPage();
    }

    trackById(_index: number, item: Content): number | string {
        return item.id;
    }

    hasRights(contentId: number | string): boolean {
        return this.contentIdsWithRights().has(String(contentId));
    }

    onFilterChange(v: string): void {
        this.filterStatus.set(v as 'all' | 'tmdb' | 'draft');
        if (v !== 'draft') this.loadPage();
    }

    goToPage(page: number): void {
        this.currentPage.set(page);
        this.loadPage();
    }

    onScrolledIndexChange(firstVisibleIndex: number): void {
        if (this.loading()) return;
        const listLength = this.sortedList().length;
        const loadMoreThreshold = 8;
        if (listLength === 0 || firstVisibleIndex < listLength - loadMoreThreshold) {
            return;
        }
        if (this.isSearchActive()) {
            this.searchService.loadMoreSearch();
        } else {
            if (this.filterStatus() === 'draft') return;
            if (this.currentPage() >= this.totalPages()) return;
            this.loadMore();
        }
    }

    private loadMore(): void {
        if (this.filterStatus() === 'draft') return;
        if (this.currentPage() >= this.totalPages()) return;
        if (this.discoverLoading()) return;
        const nextPage = this.currentPage() + 1;
        this.discoverLoading.set(true);
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
                    this.discoverLoading.set(false);
                },
                error: () => this.discoverLoading.set(false),
            });
    }

    private loadPage(): void {
        if (this.filterStatus() === 'draft') return;
        this.discoverLoading.set(true);
        this.discoverLoadingBlocking.set(true);
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
                    this.discoverLoading.set(false);
                    this.discoverLoadingBlocking.set(false);
                },
                error: () => {
                    this.discoverLoading.set(false);
                    this.discoverLoadingBlocking.set(false);
                },
            });
    }
}

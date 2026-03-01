import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { toSignal } from '@angular/core/rxjs-interop';
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
    totalPages = signal(0);
    private tmdbResults = signal<Content[]>([]);
    readonly rowHeightPx = ROW_HEIGHT_PX;

    columns: { key: string; label: string; align?: 'left' | 'center' | 'right' }[] = [
        { key: 'poster', label: '' },
        { key: 'title', label: 'Title' },
        { key: 'id', label: 'ID' },
        { key: 'releaseDate', label: 'Release date' },
        { key: 'voteAverage', label: 'Rating' },
        { key: 'actions', label: 'Actions' },
    ];

    list = computed(() => {
        const filter = this.filterStatus();
        const tmdb = this.tmdbResults();
        const drafts = this.draftService.drafts();
        if (filter === 'tmdb') return tmdb;
        if (filter === 'draft') return drafts;
        return [...drafts, ...tmdb];
    });

    constructor() {
        this.loadPage();
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

    /** Called when user scrolls near the end of the list – load next TMDB page and append */
    onScrolledIndexChange(firstVisibleIndex: number): void {
        if (this.filterStatus() === 'draft') return;
        if (this.loading()) return;
        if (this.currentPage() >= this.totalPages()) return;
        const listLength = this.list().length;
        const loadMoreThreshold = 8;
        if (listLength > 0 && firstVisibleIndex >= listLength - loadMoreThreshold) {
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
                sortBy: 'popularity.desc',
            })
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
        this.tmdb
            .discoverMovies({
                page: this.currentPage(),
                sortBy: 'popularity.desc',
            })
            .subscribe({
                next: (res) => {
                    this.tmdbResults.set(res.results);
                    this.totalPages.set(res.totalPages);
                    this.loading.set(false);
                },
                error: () => this.loading.set(false),
            });
    }
}

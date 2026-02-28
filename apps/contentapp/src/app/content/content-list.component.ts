import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    computed,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TmdbService } from '@media-content/shared-data-access';
import { TableComponent, PaginationComponent } from '@media-content/shared-ui';
import type { Content } from '@media-content/shared-types';
import { HasRoleDirective } from '@media-content/shared-auth';
import { ContentDraftService } from './content-draft.service';

@Component({
    selector: 'app-content-list',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        RouterLink,
        FormsModule,
        TableComponent,
        PaginationComponent,
        HasRoleDirective,
    ],
    templateUrl: './content-list.component.html',
    styleUrl: './content-list.component.scss',
})
export class ContentListComponent {
    private readonly tmdb = inject(TmdbService);
    private readonly draftService = inject(ContentDraftService);

    filterStatus = signal<'all' | 'tmdb' | 'draft'>('all');
    currentPage = signal(1);
    loading = signal(false);
    totalPages = signal(0);
    private tmdbResults = signal<Content[]>([]);

    columns = [
        { key: 'poster', label: '' },
        { key: 'title', label: 'Title' },
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

    onFilterChange(v: string) {
        this.filterStatus.set(v as 'all' | 'tmdb' | 'draft');
        if (v !== 'draft') this.loadPage();
    }

    goToPage(page: number) {
        this.currentPage.set(page);
        this.loadPage();
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

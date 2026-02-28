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
import {
  TableComponent,
  PaginationComponent,
} from '@media-content/shared-ui';
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
  template: `
    <h1>Content</h1>
    <div class="toolbar">
      <select [ngModel]="filterStatus()" (ngModelChange)="onFilterChange($event)">
        <option value="all">All</option>
        <option value="tmdb">From TMDB</option>
        <option value="draft">Drafts</option>
      </select>
      <span *libHasRole="'editor'">
        <a routerLink="new" class="btn">Add content</a>
      </span>
    </div>
    @if (loading()) {
      <p>Loading…</p>
    } @else {
      <lib-table [columns]="columns">
        @for (item of list(); track trackById($index, item)) {
          <tr>
            <td class="poster-cell">
              @if (item.posterPath) {
                <img [src]="item.posterPath" [alt]="item.title" class="poster-thumb" loading="lazy" />
              } @else {
                <div class="poster-placeholder">No image</div>
              }
            </td>
            <td class="title-cell">{{ item.title }}</td>
            <td>{{ item.releaseDate || '—' }}</td>
            <td>{{ item.voteAverage ?? '—' }}</td>
            <td>
              <a [routerLink]="[item.id, 'edit']">Edit</a>
            </td>
          </tr>
        }
      </lib-table>
      @if (filterStatus() !== 'draft' && totalPages() > 0) {
        <lib-pagination
          [currentPage]="currentPage()"
          [totalPages]="totalPages()"
          (pageChange)="goToPage($event)"
        />
      }
    }
  `,
  styles: [
    `
      .toolbar {
        display: flex;
        gap: 1rem;
        align-items: center;
        margin-bottom: 1rem;
      }
      .btn {
        padding: 0.5rem 1rem;
        background: var(--color-button-primary-bg);
        color: white;
        text-decoration: none;
        border-radius: var(--radius);
        font-weight: 500;
      }
      .btn:hover {
        background: var(--color-button-primary-hover);
      }
      select {
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--color-input-border);
        border-radius: 4px;
        background: var(--color-surface);
        color: var(--color-text);
      }
      :host ::ng-deep .lib-table th:first-child {
        padding: 0.75rem 0.35rem;
        width: 52px;
      }
      .poster-cell {
        width: 52px;
        padding: 0.35rem !important;
        vertical-align: middle;
      }
      .title-cell,
      .content-cell {
        padding-left: 1.25rem;
      }
      .poster-thumb {
        width: 46px;
        height: 69px;
        object-fit: cover;
        border-radius: 4px;
        display: block;
      }
      .poster-placeholder {
        width: 46px;
        height: 69px;
        background: var(--color-table-row-hover);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.65rem;
        color: var(--color-text-secondary);
        text-align: center;
      }
      h1 {
        color: var(--color-text);
        margin-bottom: 1rem;
      }
      a {
        color: var(--color-primary);
      }
    `,
  ],
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

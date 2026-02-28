import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'lib-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="pagination" aria-label="Pagination">
      <button
        type="button"
        [disabled]="currentPage() <= 1"
        (click)="goTo(currentPage() - 1)"
      >
        Previous
      </button>
      <span class="page-info">
        Page {{ currentPage() }} of {{ totalPages() }}
      </span>
      <button
        type="button"
        [disabled]="currentPage() >= totalPages()"
        (click)="goTo(currentPage() + 1)"
      >
        Next
      </button>
    </nav>
  `,
  styles: [
    `
      .pagination {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin: 1rem 0;
      }
      .pagination button {
        padding: 0.5rem 1rem;
        cursor: pointer;
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
        background: var(--color-surface);
        color: var(--color-text);
      }
      .pagination button:hover:not(:disabled) {
        background: var(--color-table-row-hover);
      }
      .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .page-info {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
      }
    `,
  ],
})
export class PaginationComponent {
  currentPage = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

  goTo(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}

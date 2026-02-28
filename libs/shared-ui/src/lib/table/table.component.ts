import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lib-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table class="lib-table">
      <thead>
        <tr>
          @for (col of columns(); track col.key) {
            <th>{{ col.label }}</th>
          }
        </tr>
      </thead>
      <tbody>
        <ng-content></ng-content>
      </tbody>
    </table>
  `,
  styles: [
    `
      .lib-table {
        width: 100%;
        border-collapse: collapse;
      }
      .lib-table th,
      .lib-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      .lib-table th {
        font-weight: 600;
        background: #f5f5f5;
      }
    `,
  ],
})
export class TableComponent<T = unknown> {
  columns = input.required<{ key: string; label: string }[]>();
  rows = input<T[]>([]);
}

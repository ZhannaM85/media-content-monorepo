import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RightsStoreService } from '@media-content/shared-data-access';
import { TableComponent } from '@media-content/shared-ui';
import { HasRoleDirective } from '@media-content/shared-auth';

@Component({
  selector: 'app-rights-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterLink, TableComponent, HasRoleDirective],
  template: `
    <h1>Rights</h1>
    <p *libHasRole="'editor'">
      <a routerLink="assign/new" class="btn">Assign rights (new)</a>
    </p>
    <lib-table [columns]="columns">
      @for (r of rights$ | async; track r.id) {
        <tr>
          <td>{{ r.contentId }}</td>
          <td>{{ r.regions.join(', ') }}</td>
          <td>{{ r.expirationDate }}</td>
          <td>{{ r.gdprAcknowledged ? 'Yes' : '—' }}</td>
          <td>
            <a [routerLink]="['assign', r.contentId]">Edit</a>
          </td>
        </tr>
      }
    </lib-table>
  `,
  styles: [
    `
      .btn {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: #1976d2;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class RightsListComponent {
  private readonly rightsStore = inject(RightsStoreService);
  rights$ = this.rightsStore.getRights();

  columns = [
    { key: 'contentId', label: 'Content ID' },
    { key: 'regions', label: 'Regions' },
    { key: 'expirationDate', label: 'Expiration' },
    { key: 'gdpr', label: 'GDPR' },
    { key: 'actions', label: 'Actions' },
  ];
}

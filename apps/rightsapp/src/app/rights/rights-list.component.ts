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
  templateUrl: './rights-list.component.html',
  styleUrl: './rights-list.component.scss',
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

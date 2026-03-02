import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RightsStoreService } from '@media-content/shared-data-access';
import { HasRoleDirective } from '@media-content/shared-auth';
import { toSignal } from '@angular/core/rxjs-interop';

/** Row height in px for CDK virtual scroll */
const ROW_HEIGHT_PX = 52;

@Component({
    selector: 'app-rights-list',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, ScrollingModule, HasRoleDirective],
    templateUrl: './rights-list.component.html',
    styleUrl: './rights-list.component.scss',
})
export class RightsListComponent {
    private readonly rightsStore = inject(RightsStoreService);
    readonly rights = toSignal(this.rightsStore.getRights(), { initialValue: [] });
    readonly storageError = toSignal(this.rightsStore.getStorageError(), {
        initialValue: null,
    });
    readonly rowHeightPx = ROW_HEIGHT_PX;

    columns: { key: string; label: string; align?: 'left' | 'center' | 'right' }[] = [
        { key: 'contentId', label: 'Content ID' },
        { key: 'regions', label: 'Regions' },
        { key: 'expirationDate', label: 'Expiration' },
        { key: 'gdpr', label: 'GDPR', align: 'center' },
        { key: 'actions', label: 'Actions', align: 'center' },
    ];
}

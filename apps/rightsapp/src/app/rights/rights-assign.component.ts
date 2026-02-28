import {
    ChangeDetectionStrategy,
    Component,
    inject,
    computed,
    effect,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { RightsStoreService } from '@media-content/shared-data-access';
import type { Region } from '@media-content/shared-types';

const REGIONS: Region[] = ['US', 'EU', 'APAC'];

@Component({
    selector: 'app-rights-assign',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './rights-assign.component.html',
    styleUrl: './rights-assign.component.scss',
})
export class RightsAssignComponent {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly rightsStore = inject(RightsStoreService);

    regions = REGIONS;
    form = this.fb.group({
        contentIdInput: [''],
        regions: [[] as Region[]],
        expirationDate: ['', Validators.required],
        gdprAcknowledged: [false],
    });

    private routeContentId = toSignal(
        this.route.paramMap.pipe(map((p) => p.get('contentId'))),
    );
    contentId = computed(() => this.routeContentId() ?? null);

    includesEu = computed(() => {
        const r = this.form.get('regions')?.value as Region[] | undefined;
        return Array.isArray(r) && r.includes('EU');
    });

    constructor() {
        effect(() => {
            const includesEu = this.includesEu();
            const gdpr = this.form.get('gdprAcknowledged');
            if (!gdpr) return;
            if (includesEu) {
                gdpr.setValidators(Validators.requiredTrue);
            } else {
                gdpr.clearValidators();
                gdpr.setValue(false);
            }
            gdpr.updateValueAndValidity();
        });
    }

    onRegionChange(region: Region, e: Event) {
        const checked = (e.target as HTMLInputElement).checked;
        const current = (this.form.get('regions')?.value as Region[]) || [];
        const next = checked
            ? [...current, region]
            : current.filter((r) => r !== region);
        this.form.get('regions')?.setValue(next);
    }

    onSubmit() {
        if (this.form.invalid) return;
        const paramId = this.contentId();
        const value = this.form.getRawValue();
        const contentId =
            paramId && paramId !== 'new'
                ? paramId
                : (value.contentIdInput ?? '').trim();
        if (!contentId) return;
        this.rightsStore.addOrUpdateRights({
            id: 'rights-' + contentId,
            contentId,
            regions: (value.regions ?? []) as Region[],
            expirationDate: value.expirationDate ?? '',
            gdprAcknowledged: value.gdprAcknowledged ?? false,
        });
        this.router.navigate(['..'], { relativeTo: this.route });
    }
}

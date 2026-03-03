import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal,
    computed,
    effect,
    type Signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TmdbService } from '@media-content/shared-data-access';
import { ContentDraftService } from './content-draft.service';

@Component({
    selector: 'app-content-form',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './content-form.component.html',
    styleUrl: './content-form.component.scss',
})
export class ContentFormComponent {
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly tmdb = inject(TmdbService);
    private readonly draftService = inject(ContentDraftService);
    private readonly destroyRef = inject(DestroyRef);

    form = this.fb.group({
        title: [
            '',
            [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(200),
                Validators.pattern(/^(?!\s)(?!.*\s$).+$/),
            ],
        ],
        overview: [''],
        releaseDate: [''],
    });

    private routeId!: Signal<string | null>;
    id = computed(() => this.routeId());
    isEdit = computed(() => !!this.id());
    isDraft = signal(false);
    posterUrl = signal<string | null>(null);
    loadError = signal<string | null>(null);
    titleError = computed(() => {
        const c = this.form.get('title');
        if (!c?.touched || !c?.errors) return null;
        if (c.errors['required']) return 'Title is required';
        if (c.errors['minlength']) return 'Title must be at least 3 characters';
        if (c.errors['maxlength']) return 'Title must be at most 200 characters';
        if (c.errors['pattern']) return 'Title cannot start or end with spaces';
        return null;
    });

    constructor() {
        this.routeId = toSignal(
            this.route.paramMap.pipe(map((p) => p.get('id'))),
            { initialValue: null as string | null },
        );
        effect(() => {
            const id = this.id();
            if (!id) {
                this.posterUrl.set(null);
                this.loadError.set(null);
                return;
            }
            const draft = this.draftService.getDraft(id);
            if (draft) {
                this.isDraft.set(true);
                this.loadError.set(null);
                this.form.patchValue({
                    title: draft.title,
                    overview: draft.overview ?? '',
                    releaseDate: draft.releaseDate ?? '',
                });
                this.posterUrl.set(
                    this.largerPosterUrl(draft.posterPath) ?? null,
                );
                return;
            }
            this.isDraft.set(false);
            this.posterUrl.set(null);
            const numId = Number(id);
            if (!Number.isNaN(numId)) {
                this.loadError.set(null);
                this.tmdb
                    .getMovie(numId)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                        next: (m) => {
                            this.form.patchValue({
                                title: m.title,
                                overview: m.overview ?? '',
                                releaseDate: m.releaseDate ?? '',
                            });
                            this.posterUrl.set(
                                this.largerPosterUrl(m.posterPath) ?? null,
                            );
                            this.loadError.set(null);
                        },
                        error: () => {
                            this.loadError.set(
                                'Failed to load movie. Please try again.',
                            );
                        },
                    });
            } else {
                this.loadError.set(null);
            }
        });
    }

    onSubmit() {
        if (this.form.invalid) return;
        const value = this.form.getRawValue();
        const id = this.id();
        if (id) {
            const draft = this.draftService.getDraft(id);
            if (draft) {
                this.draftService.updateDraft(id, {
                    title: value.title ?? '',
                    overview: value.overview ?? undefined,
                    releaseDate: value.releaseDate ?? undefined,
                });
            }
        } else {
            this.draftService.addDraft({
                title: value.title ?? '',
                overview: value.overview ?? undefined,
                releaseDate: value.releaseDate ?? undefined,
            });
        }
        this.router.navigate(['../..'], { relativeTo: this.route });
    }

    onDelete() {
        const id = this.id();
        if (id) this.draftService.removeDraft(id);
        this.router.navigate(['../..'], { relativeTo: this.route });
    }

    /** TMDB poster URL with larger size (w342) for edit view */
    private largerPosterUrl(path: string | undefined): string | undefined {
        if (!path) return undefined;
        return path.replace('/t/p/w92/', '/t/p/w342/');
    }
}

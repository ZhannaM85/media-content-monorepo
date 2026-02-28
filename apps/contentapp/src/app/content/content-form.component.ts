import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
  template: `
    <h1>{{ isEdit() ? 'Edit content' : 'New content' }}</h1>
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <div>
        <label for="title">Title</label>
        <input id="title" type="text" formControlName="title" />
        @if (titleError()) {
          <span class="error">{{ titleError() }}</span>
        }
      </div>
      <div>
        <label>Overview</label>
        <textarea formControlName="overview" rows="4"></textarea>
      </div>
      <div>
        <label>Release date</label>
        <input type="date" formControlName="releaseDate" />
      </div>
      @if (isEdit() && isDraft()) {
        <button type="button" (click)="onDelete()">Delete draft</button>
      }
      <div class="actions">
        <button type="submit" [disabled]="form.invalid">Save</button>
        <a routerLink="..">Cancel</a>
      </div>
    </form>
  `,
  styles: [
    `
      form {
        max-width: 480px;
      }
      label {
        display: block;
        margin-bottom: 0.25rem;
      }
      textarea,
      input[type='date'] {
        width: 100%;
        padding: 0.5rem;
        margin-bottom: 1rem;
        box-sizing: border-box;
      }
      .actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
      }
      .error {
        color: #d32f2f;
        font-size: 0.875rem;
      }
      input { width: 100%; padding: 0.5rem; margin-bottom: 0.5rem; box-sizing: border-box; }
    `,
  ],
})
export class ContentFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tmdb = inject(TmdbService);
  private readonly draftService = inject(ContentDraftService);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    overview: [''],
    releaseDate: [''],
  });

  private routeId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('id'))),
    { initialValue: null as string | null }
  );
  id = computed(() => this.routeId());
  isEdit = computed(() => !!this.id());
  isDraft = signal(false);
  titleError = computed(() => {
    const c = this.form.get('title');
    if (!c?.touched || !c?.errors) return null;
    if (c.errors['required']) return 'Title is required';
    return null;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;
      const draft = this.draftService.getDraft(id);
      if (draft) {
        this.isDraft.set(true);
        this.form.patchValue({
          title: draft.title,
          overview: draft.overview ?? '',
          releaseDate: draft.releaseDate ?? '',
        });
        return;
      }
      this.isDraft.set(false);
      const numId = Number(id);
      if (!Number.isNaN(numId)) {
        this.tmdb.getMovie(numId).subscribe((m) => {
          this.form.patchValue({
            title: m.title,
            overview: m.overview ?? '',
            releaseDate: m.releaseDate ?? '',
          });
        });
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
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  onDelete() {
    const id = this.id();
    if (id) this.draftService.removeDraft(id);
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}

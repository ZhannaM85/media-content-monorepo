import { Injectable, signal, computed } from '@angular/core';
import type { Content } from '@media-content/shared-types';

@Injectable({ providedIn: 'root' })
export class ContentDraftService {
    private readonly draftsSignal = signal<Content[]>([]);
    private idCounter = 0;

    drafts = this.draftsSignal.asReadonly();

    addDraft(draft: Omit<Content, 'id'>): Content {
        const id = `draft-${++this.idCounter}`;
        const content: Content = { ...draft, id, status: 'draft' };
        this.draftsSignal.update((list) => [...list, content]);
        return content;
    }

    updateDraft(id: string | number, patch: Partial<Content>): void {
        this.draftsSignal.update((list) =>
            list.map((item) =>
                String(item.id) === String(id) ? { ...item, ...patch } : item,
            ),
        );
    }

    getDraft(id: string | number): Content | undefined {
        return this.draftsSignal().find(
            (item) => String(item.id) === String(id),
        );
    }

    removeDraft(id: string | number): void {
        this.draftsSignal.update((list) =>
            list.filter((item) => String(item.id) !== String(id)),
        );
    }
}

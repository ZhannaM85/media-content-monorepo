import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import type { Rights } from '@media-content/shared-types';

const RIGHTS_STORAGE_KEY = 'media-content-rights';

@Injectable({ providedIn: 'root' })
export class RightsStoreService {
    private readonly rights$ = new BehaviorSubject<Rights[]>(
        this.loadFromStorage(),
    );

    getRights(): Observable<Rights[]> {
        return this.rights$.asObservable();
    }

    getRightsByContentId(
        contentId: number | string,
    ): Observable<Rights | undefined> {
        return this.rights$.pipe(
            map((list) =>
                list.find((r) => String(r.contentId) === String(contentId)),
            ),
        );
    }

    addOrUpdateRights(rights: Rights): void {
        const list = this.rights$.value;
        const index = list.findIndex(
            (r) =>
                r.id === rights.id ||
                String(r.contentId) === String(rights.contentId),
        );
        const next =
            index >= 0
                ? [...list.slice(0, index), rights, ...list.slice(index + 1)]
                : [...list, rights];
        this.rights$.next(next);
        this.persist(next);
    }

    removeRights(id: string): void {
        const next = this.rights$.value.filter((r) => r.id !== id);
        this.rights$.next(next);
        this.persist(next);
    }

    private loadFromStorage(): Rights[] {
        try {
            const raw = sessionStorage.getItem(RIGHTS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as Rights[];
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch {
            // ignore invalid or missing data
        }
        return [];
    }

    private persist(rights: Rights[]): void {
        try {
            sessionStorage.setItem(
                RIGHTS_STORAGE_KEY,
                JSON.stringify(rights),
            );
        } catch {
            // ignore quota or security errors
        }
    }
}

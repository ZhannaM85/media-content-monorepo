import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import type { Rights } from '@media-content/shared-types';

@Injectable({ providedIn: 'root' })
export class RightsStoreService {
    private readonly rights$ = new BehaviorSubject<Rights[]>([]);

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
    }

    removeRights(id: string): void {
        this.rights$.next(this.rights$.value.filter((r) => r.id !== id));
    }
}

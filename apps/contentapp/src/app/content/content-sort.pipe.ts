import { Pipe, PipeTransform } from '@angular/core';
import type { Content } from '@media-content/shared-types';

const SORTABLE_KEYS = new Set(['title', 'releaseDate', 'voteAverage']);

/**
 * Client-side sort for Content list. Returns a new sorted array when column/direction
 * are set and sortable; otherwise returns the same array (no copy when no sort).
 */
@Pipe({ name: 'contentSort', standalone: true })
export class ContentSortPipe implements PipeTransform {
    transform(
        items: Content[],
        column: string | null,
        direction: 'asc' | 'desc',
        skipSort = false
    ): Content[] {
        if (skipSort || !items.length) return items;
        if (!column || !SORTABLE_KEYS.has(column)) return items;

        const asc = direction === 'asc';
        return [...items].sort((a, b) => {
            const aVal = a[column as keyof Content];
            const bVal = b[column as keyof Content];
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return asc ? 1 : -1;
            if (bVal == null) return asc ? -1 : 1;
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return asc
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return asc ? aVal - bVal : bVal - aVal;
            }
            return String(aVal).localeCompare(String(bVal), undefined, {
                numeric: true,
            });
        });
    }
}

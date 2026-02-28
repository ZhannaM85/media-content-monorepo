import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'lib-table',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './table.component.html',
    styleUrl: './table.component.scss',
})
export class TableComponent<T = unknown> {
    columns = input.required<
        { key: string; label: string; align?: 'left' | 'center' | 'right' }[]
    >();
    rows = input<T[]>([]);
}

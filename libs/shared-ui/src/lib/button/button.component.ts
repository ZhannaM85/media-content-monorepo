import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
    selector: 'lib-button',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
})
export class ButtonComponent {
    type = input<'button' | 'submit'>('button');
    disabled = input(false);
    variant = input<'primary' | 'secondary'>('primary');
}

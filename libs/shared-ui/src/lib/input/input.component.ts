import {
    ChangeDetectionStrategy,
    Component,
    input,
    output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'lib-input',
    standalone: true,
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './input.component.html',
    styleUrl: './input.component.scss',
})
export class InputComponent {
    label = input('');
    type = input<'text' | 'email' | 'number' | 'date'>('text');
    placeholder = input('');
    value = input('');
    disabled = input(false);
    error = input<string | null>(null);
    valueChange = output<string>();

    onInput(e: Event) {
        this.valueChange.emit((e.target as HTMLInputElement).value);
    }
}

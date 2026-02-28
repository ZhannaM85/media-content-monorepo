import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lib-input',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label [class.has-error]="error()">{{ label() }}</label>
    <input
      [type]="type()"
      [placeholder]="placeholder()"
      [value]="value()"
      (input)="onInput($event)"
      [disabled]="disabled()"
    />
    @if (error()) {
      <span class="error">{{ error() }}</span>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      label {
        display: block;
        margin-bottom: 0.25rem;
        font-weight: 500;
      }
      label.has-error {
        color: var(--color-danger);
      }
      input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border: 1px solid var(--color-input-border);
        border-radius: 4px;
        font-size: 1rem;
        background: var(--color-surface);
        color: var(--color-text);
      }
      input:focus {
        outline: none;
        border-color: var(--color-input-focus);
      }
      .error {
        display: block;
        color: var(--color-danger);
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
    `,
  ],
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

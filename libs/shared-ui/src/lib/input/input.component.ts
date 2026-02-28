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
        color: #d32f2f;
      }
      input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }
      input:focus {
        outline: none;
        border-color: #1976d2;
      }
      .error {
        display: block;
        color: #d32f2f;
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

import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lib-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<button [type]="type()" [disabled]="disabled()" [class.primary]="variant() === 'primary'" [class.secondary]="variant() === 'secondary'">
    <ng-content></ng-content>
  </button>`,
  styles: [
    `
      button {
        padding: 0.5rem 1rem;
        border-radius: var(--radius);
        cursor: pointer;
        font-size: 1rem;
        border: 1px solid var(--color-border);
        background: var(--color-button-secondary-bg);
        color: var(--color-button-secondary-text);
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      button.primary {
        background: var(--color-button-primary-bg);
        color: white;
        border-color: var(--color-button-primary-bg);
      }
      button.primary:hover:not(:disabled) {
        background: var(--color-button-primary-hover);
        border-color: var(--color-button-primary-hover);
      }
      button.secondary:hover:not(:disabled) {
        background: var(--color-table-row-hover);
      }
    `,
  ],
})
export class ButtonComponent {
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  variant = input<'primary' | 'secondary'>('primary');
}

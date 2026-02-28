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
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        border: 1px solid #ccc;
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      button.primary {
        background: #1976d2;
        color: white;
        border-color: #1976d2;
      }
      button.secondary {
        background: #f5f5f5;
        color: #333;
      }
    `,
  ],
})
export class ButtonComponent {
  type = input<'button' | 'submit'>('button');
  disabled = input(false);
  variant = input<'primary' | 'secondary'>('primary');
}

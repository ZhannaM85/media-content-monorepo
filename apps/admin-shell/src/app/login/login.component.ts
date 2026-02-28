import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@media-content/shared-auth';
import type { Role } from '@media-content/shared-types';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="login-box">
      <h1>Media Rights Admin</h1>
      <p>Sign in (mock)</p>
      <form (ngSubmit)="onSubmit()">
        <div>
          <label for="username">Username</label>
          <input id="username" name="username" [(ngModel)]="username" required />
        </div>
        <div>
          <label for="role">Role</label>
          <select id="role" name="role" [(ngModel)]="role" required>
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  `,
  styles: [
    `
      .login-box {
        max-width: 360px;
        margin: 2rem auto;
        padding: 1.5rem;
        border: 1px solid var(--color-border);
        border-radius: var(--radius);
        background: var(--color-surface);
        box-shadow: var(--shadow-md);
      }
      .login-box h1 {
        margin-top: 0;
        margin-bottom: 0.25rem;
        color: var(--color-text);
      }
      .login-box p {
        color: var(--color-text-secondary);
        margin-bottom: 1rem;
      }
      .login-box label {
        display: block;
        margin-bottom: 0.25rem;
        color: var(--color-text);
        font-weight: 500;
      }
      .login-box input,
      .login-box select {
        width: 100%;
        padding: 0.5rem 0.75rem;
        margin-bottom: 1rem;
        box-sizing: border-box;
        border: 1px solid var(--color-input-border);
        border-radius: 4px;
        background: var(--color-surface);
        color: var(--color-text);
        font-size: 1rem;
      }
      .login-box input:focus,
      .login-box select:focus {
        outline: none;
        border-color: var(--color-input-focus);
      }
      .login-box button {
        width: 100%;
        padding: 0.6rem;
        background: var(--color-button-primary-bg);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: 500;
      }
      .login-box button:hover {
        background: var(--color-button-primary-hover);
      }
    `,
  ],
})
export class LoginComponent {
  username = '';
  role: Role = 'viewer';

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  onSubmit() {
    if (!this.username.trim()) return;
    this.auth.login(this.username.trim(), this.role);
    this.router.navigate(['/content']);
  }
}

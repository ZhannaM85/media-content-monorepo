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
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    username = '';
    role: Role = 'viewer';

    constructor(
        private readonly auth: AuthService,
        private readonly router: Router,
    ) {}

    onSubmit() {
        if (!this.username.trim()) return;
        this.auth.login(this.username.trim(), this.role);
        this.router.navigate(['/content']);
    }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService, HttpErrorService } from '@media-content/shared-auth';

@Component({
    selector: 'app-root',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterModule],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App {
    protected readonly auth = inject(AuthService);
    protected readonly httpError = inject(HttpErrorService);
    private readonly router = inject(Router);

    logout() {
        this.auth.logout();
        this.router.navigate(['/login']);
    }

    clearError(): void {
        this.httpError.clear();
    }
}

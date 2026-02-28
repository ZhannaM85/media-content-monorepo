import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
    let auth: AuthService;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthService,
                {
                    provide: Router,
                    useValue: { createUrlTree: jest.fn().mockReturnValue({}) },
                },
            ],
        });
        auth = TestBed.inject(AuthService);
        router = TestBed.inject(Router);
        auth.logout();
    });

    it('should allow activation when logged in', () => {
        auth.login('u', 'viewer');
        const result = TestBed.runInInjectionContext(() =>
            authGuard(null!, null!, null!),
        );
        expect(result).toBe(true);
    });

    it('should redirect to login when not logged in', () => {
        const result = TestBed.runInInjectionContext(() =>
            authGuard(null!, null!, null!),
        );
        expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
        expect(result).not.toBe(true);
    });
});

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
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

    it('should allow editor when user is editor', () => {
        auth.login('u', 'editor');
        const guard = roleGuard('editor');
        const result = TestBed.runInInjectionContext(() =>
            guard(null!, null!, null!),
        );
        expect(result).toBe(true);
    });

    it('should allow editor when user is admin', () => {
        auth.login('u', 'admin');
        const guard = roleGuard('editor');
        const result = TestBed.runInInjectionContext(() =>
            guard(null!, null!, null!),
        );
        expect(result).toBe(true);
    });

    it('should deny editor when user is viewer', () => {
        auth.login('u', 'viewer');
        const guard = roleGuard('editor');
        TestBed.runInInjectionContext(() => guard(null!, null!, null!));
        expect(router.createUrlTree).toHaveBeenCalledWith(['/content']);
    });
});

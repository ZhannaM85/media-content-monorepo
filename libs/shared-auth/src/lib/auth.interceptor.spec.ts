import {
    HttpErrorResponse,
    HttpHandlerFn,
    HttpRequest,
    HttpResponse,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpErrorService } from './http-error.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
    let auth: AuthService;
    let router: Router;
    let errorService: HttpErrorService;

    const mockNext: HttpHandlerFn = () =>
        of(new HttpResponse({ status: 200, body: null }));

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                AuthService,
                HttpErrorService,
                {
                    provide: Router,
                    useValue: {
                        navigate: jest.fn(),
                        createUrlTree: jest.fn().mockReturnValue({}),
                    },
                },
            ],
        });
        auth = TestBed.inject(AuthService);
        router = TestBed.inject(Router);
        errorService = TestBed.inject(HttpErrorService);
        auth.logout();
    });

    it('should add Authorization header when user has token', () => {
        auth.login('alice', 'viewer');
        const req = new HttpRequest('GET', '/api/data');
        let capturedReq: HttpRequest<unknown> | null = null;
        const next: HttpHandlerFn = (r) => {
            capturedReq = r;
            return mockNext(r);
        };

        TestBed.runInInjectionContext(() => {
            authInterceptor(req, next).subscribe();
        });

        expect(capturedReq?.headers.get('Authorization')).toBe(
            `Bearer ${auth.getToken()}`
        );
    });

    it('should not add Authorization header when user has no token', () => {
        const req = new HttpRequest('GET', '/api/data');
        let capturedReq: HttpRequest<unknown> | null = null;
        const next: HttpHandlerFn = (r) => {
            capturedReq = r;
            return mockNext(r);
        };

        TestBed.runInInjectionContext(() => {
            authInterceptor(req, next).subscribe();
        });

        expect(capturedReq?.headers.has('Authorization')).toBe(false);
    });

    it('should logout and navigate to login on 401', () => {
        auth.login('user', 'viewer');
        const req = new HttpRequest('GET', '/api/data');
        const next: HttpHandlerFn = () =>
            throwError(
                () => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' })
            );

        TestBed.runInInjectionContext(() => {
            authInterceptor(req, next).subscribe({
                error: () => undefined,
            });
        });

        expect(auth.isLoggedIn()).toBe(false);
        expect(errorService.error()).toMatchObject({
            kind: 'unauthorized',
            status: 401,
        });
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should show forbidden error on 403', () => {
        const req = new HttpRequest('GET', '/api/data');
        const next: HttpHandlerFn = () =>
            throwError(
                () => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' })
            );

        TestBed.runInInjectionContext(() => {
            authInterceptor(req, next).subscribe({
                error: () => undefined,
            });
        });

        expect(errorService.error()).toMatchObject({
            kind: 'forbidden',
            status: 403,
        });
    });

    it('should show server error on 5xx', () => {
        const req = new HttpRequest('GET', '/api/data');
        const next: HttpHandlerFn = () =>
            throwError(
                () =>
                    new HttpErrorResponse({
                        status: 500,
                        statusText: 'Internal Server Error',
                    })
            );

        TestBed.runInInjectionContext(() => {
            authInterceptor(req, next).subscribe({
                error: () => undefined,
            });
        });

        expect(errorService.error()).toMatchObject({
            kind: 'server',
            status: 500,
        });
    });

    it('should rethrow non-HttpErrorResponse errors', () => {
        const req = new HttpRequest('GET', '/api/data');
        const err = new Error('network');
        const next: HttpHandlerFn = () => throwError(() => err);

        let thrown: unknown = null;
        TestBed.runInInjectionContext(() => {
            authInterceptor(req, next).subscribe({
                error: (e) => {
                    thrown = e;
                },
            });
        });

        expect(thrown).toBe(err);
    });
});

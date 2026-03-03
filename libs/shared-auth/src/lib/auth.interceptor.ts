import {
    HttpErrorResponse,
    HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpErrorService } from './http-error.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const errorService = inject(HttpErrorService);
    const token = auth.getToken();

    if (token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });
    }

    return next(req).pipe(
        catchError((error: unknown) => {
            if (error instanceof HttpErrorResponse) {
                const status = error.status;
                if (status === 401) {
                    auth.logout();
                    errorService.showError({
                        kind: 'unauthorized',
                        status,
                        message:
                            'Your session has expired. Please sign in again.',
                    });
                    router.navigate(['/login']);
                } else if (status === 403) {
                    errorService.showError({
                        kind: 'forbidden',
                        status,
                        message:
                            'You do not have permission to perform this action.',
                    });
                } else if (status >= 500 && status < 600) {
                    errorService.showError({
                        kind: 'server',
                        status,
                        message:
                            'A server error occurred. Please try again later.',
                    });
                }
            }
            return throwError(() => error);
        }),
    );
};


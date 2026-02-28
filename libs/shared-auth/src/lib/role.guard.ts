import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import type { Role } from '@media-content/shared-types';
import { AuthService } from './auth.service';

export function roleGuard(minRole: Role): CanActivateFn {
    return () => {
        const auth = inject(AuthService);
        const router = inject(Router);
        if (auth.hasRole(minRole)) return true;
        return router.createUrlTree(['/content']);
    };
}

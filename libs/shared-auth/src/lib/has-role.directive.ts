import {
    Directive,
    TemplateRef,
    ViewContainerRef,
    inject,
    effect,
    input,
} from '@angular/core';
import type { Role } from '@media-content/shared-types';
import { AuthService } from './auth.service';

@Directive({ selector: '[libHasRole]', standalone: true })
export class HasRoleDirective {
    private readonly auth = inject(AuthService);
    private readonly templateRef = inject(TemplateRef<unknown>);
    private readonly viewContainer = inject(ViewContainerRef);

    /** Minimum role required to show the template (viewer | editor | admin). */
    libHasRole = input.required<Role>();

    constructor() {
        effect(() => {
            const role = this.libHasRole();
            const show = this.auth.hasRole(role);
            this.viewContainer.clear();
            if (show) {
                this.viewContainer.createEmbeddedView(this.templateRef);
            }
        });
    }
}

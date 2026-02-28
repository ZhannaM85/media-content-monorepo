import { Route } from '@angular/router';
import { roleGuard } from '@media-content/shared-auth';
import { RightsListComponent } from '../rights/rights-list.component';
import { RightsAssignComponent } from '../rights/rights-assign.component';

export const remoteRoutes: Route[] = [
    { path: '', component: RightsListComponent },
    {
        path: 'assign/:contentId',
        component: RightsAssignComponent,
        canActivate: [roleGuard('editor')],
    },
];

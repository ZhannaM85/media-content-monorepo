import { Route } from '@angular/router';
import { roleGuard } from '@media-content/shared-auth';
import { ContentListComponent } from '../content/content-list.component';
import { ContentFormComponent } from '../content/content-form.component';

export const remoteRoutes: Route[] = [
  { path: '', component: ContentListComponent },
  {
    path: 'new',
    component: ContentFormComponent,
    canActivate: [roleGuard('editor')],
  },
  {
    path: ':id/edit',
    component: ContentFormComponent,
    canActivate: [roleGuard('editor')],
  },
];

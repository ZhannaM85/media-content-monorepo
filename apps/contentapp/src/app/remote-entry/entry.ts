import { Component } from '@angular/core';
import { NxWelcome } from './nx-welcome';

@Component({
    imports: [NxWelcome],
    selector: 'app-contentapp-entry',
    templateUrl: './entry.component.html',
})
export class RemoteEntry {}

import { Injectable, computed, signal } from '@angular/core';

export type HttpErrorKind = 'unauthorized' | 'forbidden' | 'server' | 'network';

export interface HttpErrorState {
    kind: HttpErrorKind;
    message: string;
    status?: number;
}

@Injectable({ providedIn: 'root' })
export class HttpErrorService {
    private readonly errorSignal = signal<HttpErrorState | null>(null);

    readonly error = computed(() => this.errorSignal());

    showError(error: HttpErrorState): void {
        this.errorSignal.set(error);
    }

    clear(): void {
        this.errorSignal.set(null);
    }
}


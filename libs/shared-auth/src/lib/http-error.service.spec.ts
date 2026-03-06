import { TestBed } from '@angular/core/testing';
import { HttpErrorService } from './http-error.service';

describe('HttpErrorService', () => {
    let service: HttpErrorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [HttpErrorService],
        });
        service = TestBed.inject(HttpErrorService);
        service.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have null error initially after clear', () => {
        expect(service.error()).toBeNull();
    });

    it('should set error when showError is called', () => {
        service.showError({
            kind: 'server',
            message: 'Something went wrong',
            status: 500,
        });
        expect(service.error()).toEqual({
            kind: 'server',
            message: 'Something went wrong',
            status: 500,
        });
    });

    it('should clear error when clear is called', () => {
        service.showError({
            kind: 'forbidden',
            message: 'Access denied',
            status: 403,
        });
        expect(service.error()).not.toBeNull();
        service.clear();
        expect(service.error()).toBeNull();
    });

    it('should support all error kinds', () => {
        const kinds = ['unauthorized', 'forbidden', 'server', 'network'] as const;
        for (const kind of kinds) {
            service.clear();
            service.showError({ kind, message: 'test' });
            expect(service.error()?.kind).toBe(kind);
        }
    });
});

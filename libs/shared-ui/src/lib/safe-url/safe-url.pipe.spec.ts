import { TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SafeUrlPipe } from './safe-url.pipe';

const mockSanitizer: Pick<DomSanitizer, 'bypassSecurityTrustResourceUrl'> = {
    bypassSecurityTrustResourceUrl: (url: string) =>
        ({ toString: () => `SafeValue(${url})` }) as SafeResourceUrl,
};

describe('SafeUrlPipe', () => {
    let pipe: SafeUrlPipe;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                SafeUrlPipe,
                { provide: DomSanitizer, useValue: mockSanitizer },
            ],
        });
        pipe = TestBed.inject(SafeUrlPipe);
    });

    it('should create', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return null for null input', () => {
        expect(pipe.transform(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
        expect(pipe.transform(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
        expect(pipe.transform('')).toBeNull();
    });

    it('should return sanitized URL for valid string', () => {
        const url = 'https://example.com/embed/123';
        const result = pipe.transform(url);
        expect(result).toBeTruthy();
        expect(result?.toString()).toContain('SafeValue');
    });
});

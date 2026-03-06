import { TestBed } from '@angular/core/testing';
import { TMDB_API_BASE, TMDB_API_KEY } from './tokens';

describe('TMDB tokens', () => {
    it('should provide default TMDB_API_BASE when not overridden', () => {
        TestBed.configureTestingModule({});
        const base = TestBed.inject(TMDB_API_BASE);
        expect(base).toBe('https://api.themoviedb.org/3');
    });

    it('should provide default TMDB_API_KEY as empty string when not overridden', () => {
        TestBed.configureTestingModule({});
        const key = TestBed.inject(TMDB_API_KEY);
        expect(key).toBe('');
    });

    it('should allow overriding TMDB_API_BASE', () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: TMDB_API_BASE, useValue: 'https://custom.api' },
            ],
        });
        const base = TestBed.inject(TMDB_API_BASE);
        expect(base).toBe('https://custom.api');
    });

    it('should allow overriding TMDB_API_KEY', () => {
        TestBed.configureTestingModule({
            providers: [{ provide: TMDB_API_KEY, useValue: 'test-key' }],
        });
        const key = TestBed.inject(TMDB_API_KEY);
        expect(key).toBe('test-key');
    });
});

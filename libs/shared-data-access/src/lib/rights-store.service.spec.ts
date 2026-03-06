import { TestBed } from '@angular/core/testing';
import type { Rights } from '@media-content/shared-types';
import { RightsStoreService } from './rights-store.service';

const mockRights: Rights = {
    id: '1',
    contentId: 100,
    regions: ['US'],
    expirationDate: '2025-12-31',
};

describe('RightsStoreService', () => {
    let service: RightsStoreService;
    let sessionStorageMock: Record<string, string>;

    beforeEach(() => {
        sessionStorageMock = {};
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            return sessionStorageMock[key] ?? null;
        });
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
            sessionStorageMock[key] = value;
        });
        TestBed.configureTestingModule({
            providers: [RightsStoreService],
        });
        service = TestBed.inject(RightsStoreService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit empty list initially when storage is empty', (done) => {
        service.getRights().subscribe((rights) => {
            expect(rights).toEqual([]);
            done();
        });
    });

    it('should add rights and persist to sessionStorage', (done) => {
        service.addOrUpdateRights(mockRights);
        service.getRights().subscribe((rights) => {
            expect(rights).toHaveLength(1);
            expect(rights[0]).toEqual(mockRights);
            expect(sessionStorageMock['media-content-rights']).toBeTruthy();
            done();
        });
    });

    it('should find rights by contentId', (done) => {
        service.addOrUpdateRights(mockRights);
        service.getRightsByContentId(100).subscribe((r) => {
            expect(r).toEqual(mockRights);
            done();
        });
    });

    it('should find rights by contentId as string', (done) => {
        service.addOrUpdateRights(mockRights);
        service.getRightsByContentId('100').subscribe((r) => {
            expect(r).toEqual(mockRights);
            done();
        });
    });

    it('should remove rights by id', (done) => {
        service.addOrUpdateRights(mockRights);
        service.removeRights('1');
        service.getRights().subscribe((rights) => {
            expect(rights).toHaveLength(0);
            done();
        });
    });

    it('should update existing rights by contentId', (done) => {
        service.addOrUpdateRights(mockRights);
        const updated: Rights = {
            ...mockRights,
            regions: ['US', 'EU'],
        };
        service.addOrUpdateRights(updated);
        service.getRights().subscribe((rights) => {
            expect(rights).toHaveLength(1);
            expect(rights[0].regions).toEqual(['US', 'EU']);
            done();
        });
    });
});

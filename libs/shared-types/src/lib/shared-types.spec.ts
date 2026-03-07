import type { Role, User, Content, Region, Rights } from './shared-types';

describe('shared-types', () => {
    it('should allow valid Role values', () => {
        const roles: Role[] = ['admin', 'editor', 'viewer'];
        expect(roles).toHaveLength(3);
    });

    it('should allow valid Region values', () => {
        const regions: Region[] = ['US', 'EU', 'APAC'];
        expect(regions).toHaveLength(3);
    });

    it('should type User shape', () => {
        const user: User = {
            id: '1',
            username: 'test',
            role: 'viewer',
        };
        expect(user.role).toBe('viewer');
    });

    it('should type Content shape', () => {
        const content: Content = {
            id: 1,
            title: 'Test',
            overview: 'Overview',
        };
        expect(content.title).toBe('Test');
    });

    it('should type Rights shape', () => {
        const rights: Rights = {
            id: 'r1',
            contentId: 1,
            regions: ['US'],
            expirationDate: '2025-12-31',
        };
        expect(rights.regions).toContain('US');
    });
});

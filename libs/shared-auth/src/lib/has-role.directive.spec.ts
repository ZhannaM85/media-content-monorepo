import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HasRoleDirective } from './has-role.directive';

@Component({
    selector: 'lib-test-host',
    standalone: true,
    imports: [HasRoleDirective],
    template: `
        <div *libHasRole="requiredRole" data-testid="content">Visible</div>
    `,
})
class TestHostComponent {
    requiredRole = 'viewer' as const;
}

describe('HasRoleDirective', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let auth: AuthService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestHostComponent],
            providers: [AuthService],
        });
        auth = TestBed.inject(AuthService);
        auth.logout();
    });

    it('should show content when user has required role', () => {
        auth.login('user', 'editor');
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('Visible');
    });

    it('should show content when user has higher role', () => {
        auth.login('admin', 'admin');
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent).toContain('Visible');
    });

    it('should hide content when user is not logged in', () => {
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent?.trim()).not.toContain('Visible');
    });

    it('should hide content when user has lower role', () => {
        auth.login('user', 'viewer');
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.componentInstance.requiredRole = 'admin';
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        expect(el.textContent?.trim()).not.toContain('Visible');
    });

    it('should show when required role is met and hide when required role is higher', () => {
        auth.login('user', 'editor');
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.componentInstance.requiredRole = 'viewer';
        fixture.detectChanges();
        expect((fixture.nativeElement as HTMLElement).textContent).toContain(
            'Visible'
        );
        fixture.destroy();
        fixture = TestBed.createComponent(TestHostComponent);
        fixture.componentInstance.requiredRole = 'admin';
        fixture.detectChanges();
        expect(
            (fixture.nativeElement as HTMLElement).textContent?.trim()
        ).not.toContain('Visible');
    });
});

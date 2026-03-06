import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
    let component: ButtonComponent;
    let fixture: ComponentFixture<ButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default type button', () => {
        expect(component.type()).toBe('button');
    });

    it('should have default variant primary', () => {
        expect(component.variant()).toBe('primary');
    });

    it('should have default disabled false', () => {
        expect(component.disabled()).toBe(false);
    });

    it('should render with primary class by default', () => {
        const el = fixture.nativeElement as HTMLElement;
        const button = el.querySelector('button');
        expect(button?.classList.contains('primary')).toBe(true);
    });

    it('should render with secondary class when variant is secondary', () => {
        fixture.componentRef.setInput('variant', 'secondary');
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        const button = el.querySelector('button');
        expect(button?.classList.contains('secondary')).toBe(true);
    });

    it('should set disabled attribute when disabled is true', () => {
        fixture.componentRef.setInput('disabled', true);
        fixture.detectChanges();
        const el = fixture.nativeElement as HTMLElement;
        const button = el.querySelector('button');
        expect(button?.disabled).toBe(true);
    });
});

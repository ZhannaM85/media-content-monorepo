import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    service.logout();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be logged in initially', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('should login and set user', () => {
    service.login('alice', 'editor');
    expect(service.isLoggedIn()).toBe(true);
    expect(service.currentUser()?.username).toBe('alice');
    expect(service.currentUser()?.role).toBe('editor');
  });

  it('should return token after login', () => {
    service.login('bob', 'admin');
    const token = service.getToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe('string');
  });

  it('should logout and clear user', () => {
    service.login('alice', 'viewer');
    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('should report hasRole correctly', () => {
    service.login('user', 'editor');
    expect(service.hasRole('viewer')).toBe(true);
    expect(service.hasRole('editor')).toBe(true);
    expect(service.hasRole('admin')).toBe(false);
  });

  it('admin should have all roles', () => {
    service.login('admin', 'admin');
    expect(service.hasRole('viewer')).toBe(true);
    expect(service.hasRole('editor')).toBe(true);
    expect(service.hasRole('admin')).toBe(true);
  });
});

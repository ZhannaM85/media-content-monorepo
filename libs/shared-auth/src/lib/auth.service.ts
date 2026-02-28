import { Injectable, signal, computed } from '@angular/core';
import type { User, Role } from '@media-content/shared-types';

const TOKEN_KEY = 'media_content_auth_token';
const ROLE_ORDER: Role[] = ['viewer', 'editor', 'admin'];

function decodePayload(token: string): { sub?: string; role?: Role } | null {
    try {
        const payload = token.split('.')[1];
        if (!payload) return null;
        return JSON.parse(atob(payload)) as { sub?: string; role?: Role };
    } catch {
        return null;
    }
}

/** Mock JWT: base64-encoded payload with sub and role. Not cryptographically signed. */
function createMockToken(username: string, role: Role): string {
    const payload = btoa(JSON.stringify({ sub: username, role }));
    return `mock.${payload}.sig`;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly tokenSignal = signal<string | null>(this.getStoredToken());

    currentUser = computed<User | null>(() => {
        const token = this.tokenSignal();
        if (!token) return null;
        const payload = decodePayload(token);
        if (!payload?.sub || !payload?.role) return null;
        return {
            id: payload.sub,
            username: payload.sub,
            role: payload.role,
        };
    });

    isLoggedIn = computed(() => this.currentUser() != null);

    getToken(): string | null {
        return this.tokenSignal();
    }

    login(username: string, role: Role): void {
        const token = createMockToken(username, role);
        this.tokenSignal.set(token);
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
        }
    }

    logout(): void {
        this.tokenSignal.set(null);
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
        }
    }

    hasRole(minRole: Role): boolean {
        const user = this.currentUser();
        if (!user) return false;
        const userLevel = ROLE_ORDER.indexOf(user.role);
        const requiredLevel = ROLE_ORDER.indexOf(minRole);
        return userLevel >= requiredLevel;
    }

    private getStoredToken(): string | null {
        if (typeof localStorage === 'undefined') return null;
        const t = localStorage.getItem(TOKEN_KEY);
        if (!t) return null;
        const payload = decodePayload(t);
        return payload?.sub && payload?.role ? t : null;
    }
}

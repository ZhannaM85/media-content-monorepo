import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export type Role = 'viewer' | 'editor' | 'admin';

export async function loginAs(
    page: Page,
    role: Role,
    username = 'e2euser',
): Promise<void> {
    await page.goto('/login');
    await page.getByLabel(/username/i).fill(username);
    await page.getByLabel(/role/i).selectOption(role);
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL(/\/content/);
}

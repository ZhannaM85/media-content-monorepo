import { test, expect } from '@playwright/test';
import { loginAs } from './auth.helpers';

test.describe('Auth', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
        await page.goto('/content');
        await expect(page).toHaveURL(/\/login/);
    });

    test('login flow and content page', async ({ page }) => {
        await loginAs(page, 'editor');
        await expect(page.locator('h1')).toContainText('Content');
    });

    test('full flow: login, content list, assign rights', async ({ page }) => {
        await loginAs(page, 'admin');

        await page.goto('/rights');
        await expect(page.locator('h1')).toContainText('Rights');
        await page.getByRole('link', { name: /assign rights/i }).click();
        await expect(page).toHaveURL(/\/rights\/assign\/new/);
        await page.getByLabel(/content id/i).fill('1');
        await page.getByLabel(/expiration/i).fill('2026-12-31');
        await page.getByRole('checkbox', { name: /eu/i }).check();
        await page.getByRole('checkbox', { name: /gdpr/i }).check();
        await page.getByRole('button', { name: /save/i }).click();
        await expect(page).toHaveURL(/\/rights$/);
    });

    test('viewer cannot see add content link', async ({ page }) => {
        await loginAs(page, 'viewer');
        await expect(
            page.getByRole('link', { name: /add content/i }),
        ).toHaveCount(0);
    });
});

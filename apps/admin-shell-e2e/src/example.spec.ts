import { test, expect } from '@playwright/test';

test.describe('Media Rights Admin', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
        await page.goto('/content');
        await expect(page).toHaveURL(/\/login/);
    });

    test('login flow and content page', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/username/i).fill('e2euser');
        await page.getByLabel(/role/i).selectOption('editor');
        await page.getByRole('button', { name: /login/i }).click();
        await expect(page).toHaveURL(/\/content/);
        await expect(page.locator('h1')).toContainText('Content');
    });

    test('full flow: login, content list, assign rights', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel(/username/i).fill('admin');
        await page.getByLabel(/role/i).selectOption('admin');
        await page.getByRole('button', { name: /login/i }).click();
        await expect(page).toHaveURL(/\/content/);

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
        await page.goto('/login');
        await page.getByLabel(/username/i).fill('viewer');
        await page.getByLabel(/role/i).selectOption('viewer');
        await page.getByRole('button', { name: /login/i }).click();
        await expect(page).toHaveURL(/\/content/);
        await expect(
            page.getByRole('link', { name: /add content/i }),
        ).toHaveCount(0);
    });
});

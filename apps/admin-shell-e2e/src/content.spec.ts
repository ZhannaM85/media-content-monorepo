import { test, expect } from '@playwright/test';
import { loginAs } from './auth.helpers';

test.describe('Content page', () => {
    test('shows toolbar with search and filter', async ({ page }) => {
        await loginAs(page, 'editor');
        await expect(page.locator('h1')).toContainText('Content');
        await expect(
            page.getByPlaceholder(/search by title/i),
        ).toBeVisible();
        await expect(
            page.locator('select').filter({ has: page.locator('option[value="all"]') }),
        ).toBeVisible();
    });

    test('shows empty state or content table', async ({ page }) => {
        await loginAs(page, 'editor');
        const emptyMessage = page.getByText('No content to display.');
        const bodyTable = page.locator('.content-viewport table.lib-table').first();
        await expect(emptyMessage.or(bodyTable)).toBeVisible({ timeout: 15000 });
    });

    test('editor can open new content form', async ({ page }) => {
        await loginAs(page, 'editor');
        await page.getByRole('link', { name: /add content/i }).click();
        await expect(page).toHaveURL(/\/content\/new/);
        await expect(page.locator('h1')).toContainText(/new content/i);
        await expect(page.getByLabel(/title/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /cancel/i })).toBeVisible();
    });

    test('new content form has required fields', async ({ page }) => {
        await loginAs(page, 'editor');
        await page.goto('/content/new');
        await expect(page.getByLabel(/title/i)).toBeVisible();
        await expect(page.getByLabel(/overview/i)).toBeVisible();
        await expect(page.getByLabel(/release date/i)).toBeVisible();
    });
});

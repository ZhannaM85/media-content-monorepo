import { test, expect } from '@playwright/test';
import { loginAs } from './auth.helpers';

test.describe('Rights page', () => {
    test('shows heading and list area', async ({ page }) => {
        await loginAs(page, 'editor');
        await page.goto('/rights');
        await expect(page.locator('h1')).toContainText('Rights');
        await expect(
            page.locator('.virtual-table-wrapper, .rights-viewport, table.lib-table').first(),
        ).toBeVisible({ timeout: 10000 });
    });

    test('editor sees Assign rights (new) link', async ({ page }) => {
        await loginAs(page, 'editor');
        await page.goto('/rights');
        await expect(
            page.getByRole('link', { name: /assign rights \(new\)/i }),
        ).toBeVisible();
    });

    test('viewer cannot see Assign rights (new) on rights page', async ({ page }) => {
        await loginAs(page, 'viewer');
        await page.goto('/rights');
        await expect(
            page.getByRole('link', { name: /assign rights \(new\)/i }),
        ).toHaveCount(0);
    });

    test('assign rights form cancel returns to rights list', async ({ page }) => {
        await loginAs(page, 'editor');
        await page.goto('/rights');
        await page.getByRole('link', { name: /assign rights \(new\)/i }).click();
        await expect(page).toHaveURL(/\/rights\/assign\/new/);
        await expect(page.locator('h1')).toContainText('Assign rights');
        await page.getByRole('button', { name: /cancel/i }).click();
        await expect(page).toHaveURL(/\/rights$/);
    });

    test('assign rights form requires expiration date', async ({ page }) => {
        await loginAs(page, 'editor');
        await page.goto('/rights/assign/new');
        await page.getByLabel(/content id/i).fill('999');
        const saveBtn = page.getByRole('button', { name: /save/i });
        await expect(saveBtn).toBeDisabled();
        await page.getByLabel(/expiration/i).fill('2026-12-31');
        await expect(saveBtn).toBeEnabled();
    });

    test('assign rights form: EU and GDPR can be set and form submits', async ({ page }) => {
        await loginAs(page, 'editor');
        await page.goto('/rights');
        await page.getByRole('link', { name: /assign rights \(new\)/i }).click();
        await expect(page).toHaveURL(/\/rights\/assign\/new/);
        await page.getByLabel(/content id/i).fill('998');
        await page.getByLabel(/expiration/i).fill('2026-12-31');
        await page.getByRole('checkbox', { name: 'EU' }).check();
        await page.getByRole('checkbox', { name: /gdpr/i }).check();
        await expect(page.getByRole('button', { name: /save/i })).toBeEnabled();
        await page.getByRole('button', { name: /save/i }).click();
        await expect(page).toHaveURL(/\/rights$/);
    });
});

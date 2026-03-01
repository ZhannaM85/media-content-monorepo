import { test, expect } from '@playwright/test';

function loginAs(
    page: import('@playwright/test').Page,
    role: 'viewer' | 'editor' | 'admin',
    username = 'e2euser',
) {
    return async () => {
        await page.goto('/login');
        await page.getByLabel(/username/i).fill(username);
        await page.getByLabel(/role/i).selectOption(role);
        await page.getByRole('button', { name: /login/i }).click();
        await expect(page).toHaveURL(/\/content/);
    };
}

test.describe('Media Rights Admin', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
        await page.goto('/content');
        await expect(page).toHaveURL(/\/login/);
    });

    test('login flow and content page', async ({ page }) => {
        await loginAs(page, 'editor')();
        await expect(page.locator('h1')).toContainText('Content');
    });

    test('full flow: login, content list, assign rights', async ({ page }) => {
        await loginAs(page, 'admin')();

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
        await loginAs(page, 'viewer')();
        await expect(
            page.getByRole('link', { name: /add content/i }),
        ).toHaveCount(0);
    });

    // --- Content page ---
    test.describe('Content page', () => {
        test('shows toolbar with search and filter', async ({ page }) => {
            await loginAs(page, 'editor')();
            await expect(page.locator('h1')).toContainText('Content');
            await expect(
                page.getByPlaceholder(/search by title/i),
            ).toBeVisible();
            await expect(
                page.locator('select').filter({ has: page.locator('option[value="all"]') }),
            ).toBeVisible();
        });

        test('shows empty state or content table', async ({ page }) => {
            await loginAs(page, 'editor')();
            const emptyMessage = page.getByText('No content to display.');
            const bodyTable = page.locator('.content-viewport table.lib-table').first();
            await expect(emptyMessage.or(bodyTable)).toBeVisible({ timeout: 15000 });
        });

        test('editor can open new content form', async ({ page }) => {
            await loginAs(page, 'editor')();
            await page.getByRole('link', { name: /add content/i }).click();
            await expect(page).toHaveURL(/\/content\/new/);
            await expect(page.locator('h1')).toContainText(/new content/i);
            await expect(page.getByLabel(/title/i)).toBeVisible();
            await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
            await expect(page.getByRole('link', { name: /cancel/i })).toBeVisible();
        });

        test('new content form has required fields', async ({ page }) => {
            await loginAs(page, 'editor')();
            await page.goto('/content/new');
            await expect(page.getByLabel(/title/i)).toBeVisible();
            await expect(page.getByLabel(/overview/i)).toBeVisible();
            await expect(page.getByLabel(/release date/i)).toBeVisible();
        });
    });

    // --- Rights page ---
    test.describe('Rights page', () => {
        test('shows heading and list area', async ({ page }) => {
            await loginAs(page, 'editor')();
            await page.goto('/rights');
            await expect(page.locator('h1')).toContainText('Rights');
            await expect(
                page.locator('.virtual-table-wrapper, .rights-viewport, table.lib-table').first(),
            ).toBeVisible({ timeout: 10000 });
        });

        test('editor sees Assign rights (new) link', async ({ page }) => {
            await loginAs(page, 'editor')();
            await page.goto('/rights');
            await expect(
                page.getByRole('link', { name: /assign rights \(new\)/i }),
            ).toBeVisible();
        });

        test('viewer cannot see Assign rights (new) on rights page', async ({ page }) => {
            await loginAs(page, 'viewer')();
            await page.goto('/rights');
            await expect(
                page.getByRole('link', { name: /assign rights \(new\)/i }),
            ).toHaveCount(0);
        });

        test('assign rights form cancel returns to rights list', async ({ page }) => {
            await loginAs(page, 'editor')();
            await page.goto('/rights');
            await page.getByRole('link', { name: /assign rights \(new\)/i }).click();
            await expect(page).toHaveURL(/\/rights\/assign\/new/);
            await expect(page.locator('h1')).toContainText('Assign rights');
            await page.getByRole('button', { name: /cancel/i }).click();
            await expect(page).toHaveURL(/\/rights$/);
        });

        test('assign rights form requires expiration date', async ({ page }) => {
            await loginAs(page, 'editor')();
            await page.goto('/rights/assign/new');
            await page.getByLabel(/content id/i).fill('999');
            const saveBtn = page.getByRole('button', { name: /save/i });
            await expect(saveBtn).toBeDisabled();
            await page.getByLabel(/expiration/i).fill('2026-12-31');
            await expect(saveBtn).toBeEnabled();
        });

        test('assign rights form shows EU/GDPR required when EU selected', async ({ page }) => {
            await loginAs(page, 'editor')();
            await page.goto('/rights/assign/new');
            await page.getByLabel(/content id/i).fill('998');
            await page.getByLabel(/expiration/i).fill('2026-12-31');
            await page.getByRole('checkbox', { name: /eu/i }).check();
            const saveBtn = page.getByRole('button', { name: /save/i });
            await expect(saveBtn).toBeDisabled({ timeout: 5000 });
            await page.getByRole('checkbox', { name: /gdpr/i }).check();
            await expect(saveBtn).toBeEnabled();
        });
    });
});

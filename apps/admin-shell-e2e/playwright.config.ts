import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    ...nxE2EPreset(__filename, { testDir: './src' }),
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        baseURL,
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },
    /* When E2E_SERVER_EXTERNAL=1 (e2e:watch): one browser, one test at a time, so you can follow. */
    ...(process.env['E2E_SERVER_EXTERNAL']
        ? { workers: 1, fullyParallel: false }
        : {}),
    /* When E2E_SERVER_EXTERNAL=1 (e2e:watch), omit webServer so Playwright does not require command; you start the app yourself. */
    ...(process.env['E2E_SERVER_EXTERNAL']
        ? {}
        : {
              webServer: {
                  command: 'npx nx run admin-shell:serve',
                  url: 'http://localhost:4200',
                  reuseExistingServer: !process.env.CI,
                  timeout: 300_000,
                  cwd: workspaceRoot,
              },
          }),
    /* Use Chromium only by default (run `npm run e2e:install` once). For all browsers: add firefox/webkit projects and run `npx playwright install`. */
    /* In watch mode (E2E_SERVER_EXTERNAL), slow down the browser so you can see each step. */
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                ...(process.env['E2E_SERVER_EXTERNAL']
                    ? { launchOptions: { slowMo: 800 } }
                    : {}),
            },
        },
        // Uncomment for multi-browser (then run `npx playwright install`)
        // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
        // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        // Uncomment for mobile browsers support
        /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

        // Uncomment for branded browsers
        /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
    ],
});

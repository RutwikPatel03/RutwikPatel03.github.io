import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for the portfolio.
 *
 * Uses the system Chrome (`channel: 'chrome'`) rather than a downloaded
 * browser, so a fresh checkout needs `npm install` and nothing else.
 *
 * Scoped to the things that only go wrong on a phone — iOS zoom on focus, the
 * menu, the command palette — so the desktop project exists for future tests
 * rather than re-running assertions that pass trivially at width.
 *
 * The radio's suite left with it and now lives in the rutwik-radio repo, which
 * is why the timeouts here are ordinary: nothing waits on a YouTube player.
 */
const PORT = Number(process.env.PORTFOLIO_TEST_PORT ?? 3101);
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'mobile',
      use: {
        channel: 'chrome',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: BASE,
    reuseExistingServer: true,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

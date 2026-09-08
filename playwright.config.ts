import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests for the radio.
 *
 * Uses the system Chrome (`channel: 'chrome'`) rather than a downloaded
 * browser, so a fresh checkout needs `npm install` and nothing else.
 *
 * Every test runs twice: once at desktop width and once as a phone, because
 * the radio has two genuinely different layouts — the station strip, the
 * transport and the queue sheet all change shape — and a regression in one
 * says nothing about the other.
 */
const PORT = Number(process.env.RADIO_TEST_PORT ?? 3100);
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  // The radio waits on a real YouTube player, so these are not millisecond tests.
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  // A shared dev server and one YouTube player per worker; more workers than
  // this makes the suite slower and flakier, not faster.
  workers: 2,
  retries: process.env.CI ? 2 : 1,
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
    url: `${BASE}/radio`,
    reuseExistingServer: true,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});

import { chromium, type FullConfig } from '@playwright/test';

/**
 * Loads the radio once before the suite runs.
 *
 * `webServer` only waits for the route to answer, which happens as soon as the
 * server bundle is built. The client chunks are compiled on the first real
 * browser load, and under `next dev` that can take longer than a test is
 * willing to wait — so whichever test happened to go first was paying for the
 * compile and timing out on it.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:3100';
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  try {
    await page.goto(`${baseURL}/radio`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
    // The clock is filled by an effect, so text in it means the client bundle
    // has been built, served and hydrated at least once.
    await page
      .getByTestId('radio-clock')
      .first()
      .waitFor({ state: 'attached', timeout: 180_000 });
    await page.waitForFunction(
      () => (document.querySelector('[data-testid="radio-clock"]')?.textContent ?? '') !== '',
      undefined,
      { timeout: 180_000 }
    );
    // The playlist library is a separate route-level chunk and a separate
    // fetch; warming it keeps the first playlist test off the same cliff.
    await page.goto(`${baseURL}/radio?station=mine`, { waitUntil: 'domcontentloaded', timeout: 180_000 });
    await page.getByText('Your playlists').waitFor({ timeout: 120_000 }).catch(() => {});
  } finally {
    await browser.close();
  }
}

import { test, expect } from '@playwright/test';
import {
  openRadio,
  openSearch,
  stubYouTubeSearch,
  menuButtons,
  openRowMenu,
  chooseMenuItem,
  startPlayback,
  openSheet,
  queueTitles,
  closeSheet,
} from './helpers';

test.describe('search', () => {
  test('your own music is searched as you type, with no network call', async ({ page }) => {
    await openRadio(page);
    let calls = 0;
    await page.route('**/api/youtube-search**', async (route) => {
      calls += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true,"results":[]}' });
    });

    await openSearch(page);
    await page.locator('input[aria-label="Search"]').fill('pardesi');
    await expect(menuButtons(page).first()).toBeVisible();
    // The expensive call is never made on a keystroke.
    expect(calls).toBe(0);
  });

  test('YouTube is only searched on an explicit press', async ({ page }) => {
    await openRadio(page);
    const stub = await stubYouTubeSearch(page);
    await openSearch(page);
    await page.locator('input[aria-label="Search"]').fill('a phrase that matches nothing local');

    await expect(page.getByText(stub[0].title)).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(page.getByText(stub[0].title)).toBeVisible();
  });

  test('a failing search says so instead of showing nothing', async ({ page }) => {
    await openRadio(page);
    await page.route('**/api/youtube-search**', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'YouTube search is not configured on this deployment.' }),
      })
    );
    await openSearch(page);
    await page.locator('input[aria-label="Search"]').fill('anything at all here');
    await page.keyboard.press('Enter');
    await expect(page.getByText(/not configured on this deployment/)).toBeVisible();
  });

  test('the remaining daily allowance is reported', async ({ page }) => {
    await openRadio(page);
    await stubYouTubeSearch(page);
    await openSearch(page);
    await page.locator('input[aria-label="Search"]').fill('no local match for this phrase');
    await page.keyboard.press('Enter');
    await expect(page.getByText(/99 searches left today/)).toBeVisible();
  });

  test('a YouTube result can be queued without leaving the search', async ({ page }) => {
    await openRadio(page);
    const stub = await stubYouTubeSearch(page);
    await startPlayback(page);
    await openSearch(page);
    await page.locator('input[aria-label="Search"]').fill('no local match for this phrase');
    await page.keyboard.press('Enter');
    await expect(page.getByText(stub[0].title)).toBeVisible();

    const row = page.locator('div').filter({ hasText: stub[0].title }).filter({ has: menuButtons(page) }).last();
    await openRowMenu(page, row);
    await chooseMenuItem(page, 'Play next');

    // The palette stays up so a second song can be queued from the same results.
    await expect(page.locator('input[aria-label="Search"]')).toBeVisible();
    await page.keyboard.press('Escape');

    await openSheet(page);
    expect((await queueTitles(page))[0]).toBe(stub[0].title);
    await closeSheet(page);
  });

  test('Escape closes the palette', async ({ page }) => {
    await openRadio(page);
    await openSearch(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('input[aria-label="Search"]')).toHaveCount(0);
  });
});

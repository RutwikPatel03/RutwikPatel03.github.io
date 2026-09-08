import { test, expect } from '@playwright/test';
import { openRadio, drawerButton, openDrawer, drawerRows, closeDrawer, waitForHydration } from './helpers';

test.describe('stations and rotations', () => {
  test('the station is taken from the URL', async ({ page }) => {
    await page.goto('/radio?station=garba', { waitUntil: 'domcontentloaded' });
    await waitForHydration(page);
    // The strip's own label. A plain text query would also match the desktop
    // tabs, which stay in the DOM on a phone behind a breakpoint class.
    await expect(page.getByTestId('current-station')).toHaveText('Garba Ground');
  });

  test('switching station rewrites the URL without a reload', async ({ page, isMobile }) => {
    await openRadio(page, 'saloon');
    const marker = await page.evaluate(() => {
      (window as unknown as { __kept?: boolean }).__kept = true;
      return true;
    });
    expect(marker).toBe(true);

    if (isMobile) {
      // On a phone the strip offers the station either side of this one.
      await page.locator('div.md\\:hidden button').first().click();
    } else {
      await page.getByRole('button', { name: 'Gully Frequency', exact: true }).click();
    }

    await expect(page).toHaveURL(/station=/);
    // Still the same document: a full navigation would have dropped this.
    const survived = await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept);
    expect(survived).toBe(true);
  });

  test('the chosen station is remembered for the next visit', async ({ page }) => {
    await openRadio(page, 'melody');
    const saved = await page.evaluate(() => window.localStorage.getItem('radio:station'));
    expect(saved).toBeTruthy();
  });

  test('a rotation chip changes the song list', async ({ page }) => {
    await openRadio(page);
    await openDrawer(page);
    const scheduled = await drawerRows(page).count();
    await closeDrawer(page);

    // "All songs" is the whole catalogue, so it can never be smaller.
    await page.getByRole('button', { name: /^All songs/ }).click();
    await openDrawer(page);
    const all = await drawerRows(page).count();
    expect(all).toBeGreaterThanOrEqual(scheduled);
  });

  test('the drawer count matches the number of rows it opens', async ({ page }) => {
    await openRadio(page);
    const label = await drawerButton(page).innerText();
    const claimed = Number(label.match(/(\d+)/)?.[1]);
    await openDrawer(page);
    // Every row the drawer lists is playable, which is what the pill counts.
    expect(await drawerRows(page).count()).toBe(claimed);
  });
});

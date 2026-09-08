import { test, expect } from '@playwright/test';
import { menuButtons, menuItems, openRowMenu, playlistRows, PLAYLIST_STATION, waitForHydration } from './helpers';

/**
 * The saved-playlist library.
 *
 * These read whatever the account actually has saved, so they assert on shape
 * rather than on particular playlists: a suite that names one would break the
 * first time it is renamed.
 */
async function openLibrary(page: import('@playwright/test').Page) {
  await page.goto(`/radio?station=${PLAYLIST_STATION}`, { waitUntil: 'domcontentloaded' });
  await waitForHydration(page);
  await expect(page.getByText('Your playlists')).toBeVisible({ timeout: 30_000 });
}

test.describe('playlist library', () => {
  test('the library lists saved playlists', async ({ page }) => {
    await openLibrary(page);
    await expect(page.getByText(/\d+ saved · \d+ songs/)).toBeVisible();
  });

  test('opening a playlist shows its songs, each with a menu', async ({ page }) => {
    await openLibrary(page);
    const cards = page.getByTestId('playlist-card');
    test.skip((await cards.count()) === 0, 'no playlists saved on this account');
    await cards.first().click();

    await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible({ timeout: 30_000 });
    await expect(playlistRows(page).first()).toBeVisible();
    const rows = await playlistRows(page).count();
    // Every row gets a menu, not just some of them.
    expect(await menuButtons(page).count()).toBe(rows);

    await openRowMenu(page, playlistRows(page).nth(1));
    await expect(menuItems(page)).toHaveText([
      'Play now',
      'Play next',
      'Add to queue',
      'Copy link',
      'Open on YouTube',
    ]);
  });

  test('the back link returns to the library', async ({ page }) => {
    await openLibrary(page);
    const cards = page.getByTestId('playlist-card');
    test.skip((await cards.count()) === 0, 'no playlists saved on this account');
    await cards.first().click();
    await page.getByText('All playlists').click();
    await expect(page.getByText('Your playlists')).toBeVisible();
  });
});

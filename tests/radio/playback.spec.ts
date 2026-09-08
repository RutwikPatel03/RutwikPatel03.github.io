import { test, expect } from '@playwright/test';
import {
  openRadio,
  startPlayback,
  openSheet,
  queueTitles,
  playerBar,
  elapsed,
  sheet,
  sheetTitle,
} from './helpers';

test.describe('playback', () => {
  test('there is no player bar until something is playing', async ({ page }) => {
    await openRadio(page);
    await expect(page.locator('[aria-label="Open player and queue"]')).toHaveCount(0);
  });

  test('picking a song starts it and raises the mini player', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await expect(playerBar(page)).toBeVisible();
    // The clock actually moves; a stalled player would sit at zero.
    await expect.poll(async () => elapsed(page), { timeout: 45_000 }).toBeGreaterThan(0);
  });

  test('pause stops the clock and play restarts it', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await expect.poll(async () => elapsed(page), { timeout: 45_000 }).toBeGreaterThan(0);

    await page.locator('button[aria-label="Pause"]').first().click();
    const atPause = await elapsed(page);
    await page.waitForTimeout(2500);
    expect(await elapsed(page)).toBeLessThanOrEqual(atPause + 1);

    await page.locator('button[aria-label="Play"]').first().click();
    await expect.poll(async () => elapsed(page), { timeout: 30_000 }).toBeGreaterThan(atPause);
  });

  test('skip forward moves to the song that was next', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openSheet(page);
    const wasNext = (await queueTitles(page))[0];
    // Scoped to the sheet: the main transport and the mini bar carry the same
    // label, and both sit behind this overlay.
    await sheet(page).getByRole('button', { name: 'Next song' }).click();

    await expect(sheetTitle(page)).toHaveText(wasNext, { timeout: 45_000 });
  });

  test('the expanded player shows the song and a working queue', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openSheet(page);
    await expect(sheetTitle(page)).not.toHaveText('Nothing playing');
    expect((await queueTitles(page)).length).toBeGreaterThan(2);
  });
});

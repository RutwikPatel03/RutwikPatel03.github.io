import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Shared moves for driving the radio.
 *
 * The page is one long-lived audio session rather than a set of documents, so
 * almost every test needs the same three things: get to a known station, get
 * something actually playing, and read the queue back.
 */

/** A station whose catalogue is large enough to reorder without wrapping. */
export const STATION = 'saloon';
export const PLAYLIST_STATION = 'mine';

export async function openRadio(page: Page, station = STATION) {
  await page.goto(`/radio?station=${station}`, { waitUntil: 'domcontentloaded' });
  await waitForHydration(page);
  await expect(drawerButton(page)).toBeVisible();
}

/**
 * Waits until React has actually taken over the server-rendered markup.
 *
 * Every control is present in the HTML before hydration, so a click can land
 * on a real, visible button and simply be dropped — which is what made the
 * drawer "fail to open" intermittently. The clock is empty on the server and
 * filled by an effect, so text in it means handlers are attached.
 */
export async function waitForHydration(page: Page) {
  await expect(page.getByTestId('radio-clock').first()).not.toHaveText('', { timeout: 30_000 });
}

/** The "N songs" pill, which is also the only door into the song drawer. */
export function drawerButton(page: Page): Locator {
  return page.locator('button').filter({ hasText: /^\d+ songs$/ }).last();
}

export function menuButtons(page: Page): Locator {
  return page.locator('button[aria-label^="More options"]');
}

export function menuItems(page: Page): Locator {
  return page.locator('[role="menuitem"]');
}

/**
 * Rows of the song drawer.
 *
 * Addressed by test id, not by `ul[data-lenis-prevent]`: the queue sheet's
 * Reorder.Group renders a `ul` carrying the same attribute, so the looser
 * selector matched two different lists depending on what happened to be open.
 */
export function drawerRows(page: Page): Locator {
  return page.getByTestId('song-drawer').locator('> li');
}

/** Rows of the queue inside the expanded player. */
export function queueRows(page: Page): Locator {
  return page.getByTestId('queue-list').locator('> li');
}

/** Rows of an opened saved playlist. */
export function playlistRows(page: Page): Locator {
  return page.getByTestId('playlist-tracks').locator('> li');
}

export async function openDrawer(page: Page) {
  await drawerButton(page).click();
  await expect(drawerRows(page).first()).toBeVisible();
}

export async function closeDrawer(page: Page) {
  await page.locator('button[aria-label="Close song list"]').click();
  await expect(page.getByTestId('song-drawer')).toHaveCount(0);
}

/**
 * Starts playback and waits for the player to genuinely reach it.
 *
 * Waiting on the mini player rather than on a click is the whole point: the
 * YouTube iframe takes seconds to load, and every assertion about the queue is
 * meaningless until a song is actually on air.
 */
export async function startPlayback(page: Page, rowIndex = 0) {
  await openDrawer(page);
  await drawerRows(page).nth(rowIndex).locator('button').first().click();
  await expect(page.locator('[aria-label="Open player and queue"]')).toBeVisible({ timeout: 60_000 });
  // Let the first progress tick land, so "is it still playing" checks have a
  // non-zero baseline to compare against.
  await expect(playerBar(page)).not.toHaveText('', { timeout: 30_000 });
}

/** The expanded player, and the controls that belong to it rather than the bar. */
export function sheet(page: Page): Locator {
  return page.getByTestId('now-playing-sheet');
}

/** The song title as the expanded player shows it. */
export function sheetTitle(page: Page): Locator {
  return page.getByTestId('sheet-now-playing');
}

/** The mini player pinned to the bottom once something is on air. */
export function playerBar(page: Page): Locator {
  return page.locator('[aria-label="Open player and queue"]');
}

/**
 * Seconds elapsed in the current song.
 *
 * Read off the scrubber's `aria-valuenow` rather than the digits beside it:
 * the mini player hides its time readout below the `sm` breakpoint, so the
 * visible text exists on desktop and not on a phone.
 */
export async function elapsed(page: Page): Promise<number> {
  const value = await page
    .locator('[role="slider"][aria-label*="mini player"]')
    .getAttribute('aria-valuenow');
  return value === null ? -1 : Number(value);
}

export async function openSheet(page: Page) {
  await page.locator('[aria-label="Open player and queue"]').click();
  await expect(page.locator('button[aria-label="Close player"]')).toBeVisible();
  // The sheet paints before its queue does; reading the order too early gets
  // an empty list rather than a wrong one, which is a confusing way to fail.
  await expect(queueRows(page).first()).toBeVisible();
}

export async function closeSheet(page: Page) {
  await page.locator('button[aria-label="Close player"]').click();
  await expect(page.locator('button[aria-label="Close player"]')).toBeHidden();
}

/** Titles of the upcoming queue, in playback order. */
export async function queueTitles(page: Page): Promise<string[]> {
  const texts = await queueRows(page).allInnerTexts();
  return texts.map((t) => t.split('\n').filter(Boolean)[0] ?? '');
}

/** Title of one drawer row, which reads "<position>\n<title>\n<artist>". */
export async function drawerRowTitle(page: Page, index: number): Promise<string> {
  const parts = (await drawerRows(page).nth(index).innerText()).split('\n').filter((x) => x.trim());
  return parts[1] ?? parts[0];
}

export async function openRowMenu(page: Page, row: Locator) {
  await row.locator('button[aria-label^="More options"]').click();
  await expect(menuItems(page).first()).toBeVisible();
}

export async function chooseMenuItem(page: Page, label: string) {
  await page.getByRole('menuitem', { name: label, exact: true }).click();
  await expect(menuItems(page)).toHaveCount(0);
}

export async function openSearch(page: Page) {
  await page.locator('button[aria-label="Search music"]').click();
  await expect(page.locator('input[aria-label="Search"]')).toBeFocused();
}

/**
 * Answers the YouTube search endpoint from the test instead of Google.
 *
 * Non-negotiable: the real endpoint is capped at 100 calls a day for the whole
 * site, and a suite that runs twice per viewport would eat that allowance in a
 * couple of runs and take search down for real visitors.
 */
export async function stubYouTubeSearch(
  page: Page,
  results = [
    { videoId: 'dQw4w9WgXcQ', title: 'Stub Song One', author: 'Stub Artist' },
    { videoId: 'y6120QOlsfU', title: 'Stub Song Two', author: 'Another Stub' },
  ]
) {
  await page.route('**/api/youtube-search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, results, cached: true, remaining: 99 }),
    });
  });
  return results;
}

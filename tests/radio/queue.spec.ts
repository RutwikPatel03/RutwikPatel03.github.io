import { test, expect } from '@playwright/test';
import {
  openRadio,
  openDrawer,
  closeDrawer,
  drawerRows,
  drawerRowTitle,
  startPlayback,
  openSheet,
  closeSheet,
  queueRows,
  queueTitles,
  openRowMenu,
  chooseMenuItem,
  playerBar,
  elapsed,
  sheetTitle,
} from './helpers';

/**
 * Queue manipulation: the part with real invariants.
 *
 * The queue wraps, a song can already be in it, and the position of the
 * currently playing song has to survive every edit — so these tests assert on
 * the resulting order, not just that a click was accepted.
 */
test.describe('queue', () => {
  test('play next inserts after the current song and leaves the rest alone', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openSheet(page);
    const before = await queueTitles(page);
    await closeSheet(page);

    await openDrawer(page);
    // A row far enough down that it cannot already be next.
    const target = await drawerRowTitle(page, 14);
    expect(before.slice(0, 3)).not.toContain(target);
    await openRowMenu(page, drawerRows(page).nth(14));
    await chooseMenuItem(page, 'Play next');
    await closeDrawer(page);

    await openSheet(page);
    const after = await queueTitles(page);
    expect(after[0]).toBe(target);
    // Everything that was coming still is, one place later.
    expect(after.slice(1, 4)).toEqual(before.slice(0, 3));
  });

  test('play next does not restart or change the current song', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    const titleBefore = await playerBar(page).innerText();
    const atBefore = await elapsed(page);

    await openDrawer(page);
    await openRowMenu(page, drawerRows(page).nth(12));
    await chooseMenuItem(page, 'Play next');
    await closeDrawer(page);

    // Same song, and the clock has not gone backwards.
    await expect(playerBar(page)).toContainText(titleBefore.split('\n')[0]);
    expect(await elapsed(page)).toBeGreaterThanOrEqual(atBefore);
  });

  test('add to queue puts the song last, not next', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openSheet(page);
    const before = await queueTitles(page);
    await closeSheet(page);

    await openDrawer(page);
    const target = await drawerRowTitle(page, 9);
    await openRowMenu(page, drawerRows(page).nth(9));
    await chooseMenuItem(page, 'Add to queue');
    await closeDrawer(page);

    await openSheet(page);
    // Poll: the sheet rebuilds its rows from the new queue a render later.
    await expect
      .poll(async () => (await queueTitles(page)).at(-1))
      .toBe(target);
    expect((await queueTitles(page))[0]).toBe(before[0]);
  });

  test('queueing a song already in the queue moves it rather than duplicating it', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openSheet(page);
    const before = await queueTitles(page);
    await closeSheet(page);

    // Pick something already queued further down, then pull it to the front.
    const target = before[before.length - 2];
    await openDrawer(page);
    const rows = await drawerRows(page).count();
    let found = -1;
    for (let i = 0; i < rows; i++) {
      if ((await drawerRowTitle(page, i)) === target) {
        found = i;
        break;
      }
    }
    expect(found).toBeGreaterThanOrEqual(0);
    await openRowMenu(page, drawerRows(page).nth(found));
    await chooseMenuItem(page, 'Play next');
    await closeDrawer(page);

    await openSheet(page);
    const after = await queueTitles(page);
    expect(after[0]).toBe(target);
    // The length is the invariant: a duplicate would make it longer.
    expect(after).toHaveLength(before.length);
    expect(after.filter((t) => t === target)).toHaveLength(1);
  });

  test('a toast confirms the queue change', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openDrawer(page);
    await openRowMenu(page, drawerRows(page).nth(11));
    await chooseMenuItem(page, 'Play next');

    const toast = page.locator('[role="status"]');
    await expect(toast).toHaveText('Playing next');
    // And it gets out of the way on its own.
    await expect(toast).toBeHidden({ timeout: 10_000 });
  });

  test('the queue menu offers move and remove', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openSheet(page);
    await openRowMenu(page, queueRows(page).nth(0));
    await expect(page.locator('[role="menuitem"]')).toHaveText([
      'Play now',
      'Move to next',
      'Copy link',
      'Open on YouTube',
      'Remove from queue',
    ]);
  });

  test('move to next promotes a row from further down the queue', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openSheet(page);
    const before = await queueTitles(page);
    const target = before[3];

    await openRowMenu(page, queueRows(page).nth(3));
    await chooseMenuItem(page, 'Move to next');

    const after = await queueTitles(page);
    expect(after[0]).toBe(target);
    expect(after).toHaveLength(before.length);
  });

  test('remove takes exactly one song out of the queue', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openSheet(page);
    const before = await queueTitles(page);
    const doomed = before[1];

    await openRowMenu(page, queueRows(page).nth(1));
    await chooseMenuItem(page, 'Remove from queue');

    const after = await queueTitles(page);
    expect(after).toHaveLength(before.length - 1);
    expect(after).not.toContain(doomed);
    // The song playing is untouched by a queue edit.
    expect(after[0]).toBe(before[0]);
  });

  test('playing a queue row jumps straight to it', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openSheet(page);
    const target = (await queueTitles(page))[1];

    await openRowMenu(page, queueRows(page).nth(1));
    await chooseMenuItem(page, 'Play now');

    await expect(sheetTitle(page)).toHaveText(target, { timeout: 45_000 });
  });
});

import { test, expect } from '@playwright/test';
import {
  openRadio,
  openDrawer,
  drawerRows,
  drawerRowTitle,
  menuButtons,
  menuItems,
  openRowMenu,
  openSearch,
  stubYouTubeSearch,
} from './helpers';

/**
 * The per-song options menu, on every list that shows songs.
 *
 * There are four such lists and they are four separate components, which is
 * exactly why this is tested per surface: the menu was originally added to one
 * of them and silently missing from the other three.
 */
test.describe('song options menu', () => {
  test('every drawer row has a menu, and it offers the full set', async ({ page }) => {
    await openRadio(page);
    await openDrawer(page);

    const rows = await drawerRows(page).count();
    expect(rows).toBeGreaterThan(3);
    await expect(menuButtons(page)).toHaveCount(rows);

    await openRowMenu(page, drawerRows(page).nth(1));
    await expect(menuItems(page)).toHaveText([
      'Play now',
      'Play next',
      'Add to queue',
      'Copy link',
      'Open on YouTube',
    ]);
  });

  test('the menu names the song it belongs to', async ({ page }) => {
    await openRadio(page);
    await openDrawer(page);
    const title = await drawerRowTitle(page, 2);
    await expect(drawerRows(page).nth(2).locator('button[aria-label^="More options"]')).toHaveAttribute(
      'aria-label',
      `More options for ${title}`
    );
  });

  test('the menu closes on Escape without closing the drawer under it', async ({ page }) => {
    await openRadio(page);
    await openDrawer(page);
    await openRowMenu(page, drawerRows(page).nth(0));

    await page.keyboard.press('Escape');
    await expect(menuItems(page)).toHaveCount(0);
    // The drawer must survive: one Escape, one thing closed.
    await expect(drawerRows(page).first()).toBeVisible();
  });

  test('clicking away closes the menu without playing the row underneath', async ({ page }) => {
    await openRadio(page);
    await openDrawer(page);
    await openRowMenu(page, drawerRows(page).nth(0));
    await page.mouse.click(5, 5);
    await expect(menuItems(page)).toHaveCount(0);
    await expect(drawerRows(page).first()).toBeVisible();
    // Nothing started: the click was a dismissal, not a play.
    await expect(page.locator('[aria-label="Open player and queue"]')).toHaveCount(0);
  });

  test('the ⋮ does not trigger the row it sits in', async ({ page }) => {
    await openRadio(page);
    await openDrawer(page);
    await drawerRows(page).nth(1).locator('button[aria-label^="More options"]').click();
    await expect(menuItems(page).first()).toBeVisible();
    // Opening a menu is not a play command.
    await expect(page.locator('[aria-label="Open player and queue"]')).toHaveCount(0);
  });

  test('search results carry the same menu', async ({ page }) => {
    await openRadio(page);
    await stubYouTubeSearch(page);
    await openSearch(page);
    await page.locator('input[aria-label="Search"]').fill('pardesi');

    await expect(menuButtons(page).first()).toBeVisible();
    await openRowMenu(page, page.locator('div').filter({ has: menuButtons(page) }).last());
    await expect(menuItems(page)).toHaveText([
      'Play now',
      'Play next',
      'Add to queue',
      'Copy link',
      'Open on YouTube',
    ]);
  });

  test('YouTube results carry the menu too', async ({ page }) => {
    await openRadio(page);
    const stub = await stubYouTubeSearch(page);
    await openSearch(page);
    await page.locator('input[aria-label="Search"]').fill('something with no local match at all');
    await page.keyboard.press('Enter');

    await expect(page.getByText(stub[0].title)).toBeVisible();
    await expect(menuButtons(page)).toHaveCount(stub.length);
  });

  test('copy link puts a watch URL on the clipboard', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are chromium-only here');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openRadio(page);
    await openDrawer(page);
    await openRowMenu(page, drawerRows(page).nth(0));
    await page.getByRole('menuitem', { name: 'Copy link', exact: true }).click();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);
  });
});

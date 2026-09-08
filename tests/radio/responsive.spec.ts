import { test, expect, type Page } from '@playwright/test';
import {
  openRadio,
  openDrawer,
  closeDrawer,
  drawerRows,
  drawerButton,
  startPlayback,
  openSheet,
  queueRows,
  openSearch,
  openRowMenu,
  menuItems,
  stubYouTubeSearch,
} from './helpers';

/** Apple and Android both put the minimum comfortable touch target at ~44px. */
const MIN_TOUCH = 40;

/** Anything sticking out past the viewport, ignoring the hidden YouTube mount. */
async function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    return { scrollWidth: de.scrollWidth, innerWidth: window.innerWidth };
  });
}

/** Visible controls smaller than a fingertip. */
async function smallTargets(page: Page, min: number) {
  return page.evaluate((limit) => {
    const out: { label: string; w: number; h: number }[] = [];
    document.querySelectorAll('button,[role="button"],[role="menuitem"]').forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) return;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') return;
      if (b.height < limit || b.width < limit) {
        out.push({
          label: (el.getAttribute('aria-label') || (el as HTMLElement).innerText || el.tagName)
            .trim()
            .slice(0, 40),
          w: Math.round(b.width),
          h: Math.round(b.height),
        });
      }
    });
    return out;
  }, min);
}

test.describe('layout holds at every width', () => {
  test('the page never scrolls sideways, on any surface', async ({ page }) => {
    await openRadio(page);
    const check = async (where: string) => {
      const { scrollWidth, innerWidth } = await horizontalOverflow(page);
      expect(scrollWidth, `${where} scrolls sideways`).toBeLessThanOrEqual(innerWidth + 1);
    };

    await check('home');
    await openDrawer(page);
    await check('song drawer');
    await openRowMenu(page, drawerRows(page).nth(1));
    await check('drawer with menu open');
    await page.keyboard.press('Escape');
    await closeDrawer(page);

    await openSearch(page);
    await page.locator('input[aria-label="Search"]').fill('pardesi');
    await check('search');
    await page.keyboard.press('Escape');

    await startPlayback(page);
    await check('playing');
    await openSheet(page);
    await check('expanded player');
  });

  test('a menu opened near the bottom stays on screen', async ({ page }) => {
    await openRadio(page);
    await openDrawer(page);

    // The last visible row is the worst case: a menu opening downwards from
    // here would hang off the bottom of a phone.
    const rows = await drawerRows(page).count();
    await openRowMenu(page, drawerRows(page).nth(Math.min(rows - 1, 8)));

    const box = await page.locator('[role="menu"]').boundingBox();
    const vp = page.viewportSize()!;
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(vp.width + 1);
    expect(box!.y + box!.height).toBeLessThanOrEqual(vp.height + 1);
  });

  test('every song list scrolls inside itself rather than growing the page', async ({ page }) => {
    await openRadio(page);
    await openDrawer(page);
    const list = page.locator('ul[data-lenis-prevent]').first();
    const scrolls = await list.evaluate((el) => el.scrollHeight > el.clientHeight);
    // With a full rotation there is always more than fits.
    expect(scrolls).toBe(true);
    const { scrollWidth, innerWidth } = await horizontalOverflow(page);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 1);
  });
});

test.describe('usable with a thumb', () => {
  test.skip(({ isMobile }) => !isMobile, 'touch sizing only matters on a phone');

  test('the controls on the home screen are big enough to hit', async ({ page }) => {
    await openRadio(page);
    const small = await smallTargets(page, MIN_TOUCH);
    // Skip links are keyboard affordances, never tapped.
    const real = small.filter((s) => !/skip to content/i.test(s.label));
    expect(real, `too small: ${JSON.stringify(real)}`).toEqual([]);
  });

  test('the drawer door and its rows are thumb-sized', async ({ page }) => {
    await openRadio(page);
    const door = await drawerButton(page).boundingBox();
    expect(door!.height).toBeGreaterThanOrEqual(MIN_TOUCH);

    await openDrawer(page);
    const menu = await drawerRows(page).nth(0).locator('button[aria-label^="More options"]').boundingBox();
    expect(menu!.height).toBeGreaterThanOrEqual(MIN_TOUCH);
    expect(menu!.width).toBeGreaterThanOrEqual(MIN_TOUCH);
  });

  test('menu items are comfortable to tap', async ({ page }) => {
    await openRadio(page);
    await openDrawer(page);
    await openRowMenu(page, drawerRows(page).nth(1));
    const count = await menuItems(page).count();
    for (let i = 0; i < count; i++) {
      const box = await menuItems(page).nth(i).boundingBox();
      expect(box!.height, `menu item ${i}`).toBeGreaterThanOrEqual(32);
    }
  });

  test('the queue rows keep drag handle, title and menu apart', async ({ page }) => {
    await openRadio(page);
    await startPlayback(page);
    await openSheet(page);
    const row = queueRows(page).first();
    const handle = await row.locator('[aria-label="Drag to reorder"]').boundingBox();
    const menu = await row.locator('button[aria-label^="More options"]').boundingBox();
    expect(handle).not.toBeNull();
    expect(menu).not.toBeNull();
    // They must not overlap, or a drag becomes a menu tap.
    expect(menu!.x).toBeGreaterThan(handle!.x + handle!.width);
  });
});

test.describe('every feature is reachable on a phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'this is the phone inventory');

  test('search, stations, rotations, drawer, queue and menus all open', async ({ page }) => {
    await openRadio(page);
    await stubYouTubeSearch(page);

    // Search
    await openSearch(page);
    await page.keyboard.press('Escape');

    // The station either side, which replaces the desktop tab strip
    await expect(page.locator('div.md\\:hidden button')).toHaveCount(2);

    // Rotations
    await expect(page.getByRole('button', { name: /^All songs/ })).toBeVisible();

    // Drawer and its menu
    await openDrawer(page);
    await openRowMenu(page, drawerRows(page).nth(0));
    await expect(menuItems(page)).toHaveCount(5);
    await page.keyboard.press('Escape');
    await closeDrawer(page);

    // Playback, expanded player and the queue menu
    await startPlayback(page);
    await openSheet(page);
    await expect(queueRows(page).first()).toBeVisible();
    await openRowMenu(page, queueRows(page).first());
    await expect(menuItems(page)).toHaveCount(5);
  });
});

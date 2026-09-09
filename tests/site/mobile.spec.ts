import { test, expect, type Page } from '@playwright/test';

/**
 * The things that only go wrong on a phone.
 *
 * Everything here passes trivially at desktop width, so the suite is scoped to
 * the mobile project rather than asserted twice.
 */
test.describe('on a phone', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone-only behaviour');

  /**
   * iOS Safari zooms the page in when a field holding text smaller than 16px
   * takes focus, and leaves it zoomed after the field is dismissed — the whole
   * site ends up oversized and scrolling sideways until it is pinched back.
   * Every field was 14px, so tapping search did exactly that.
   */
  async function fieldSizes(page: Page) {
    return page.evaluate(() =>
      [...document.querySelectorAll('input, textarea, select')]
        .filter((el) => {
          const type = (el as HTMLInputElement).type;
          if (['range', 'checkbox', 'radio', 'hidden'].includes(type)) return false;
          const box = el.getBoundingClientRect();
          return box.width > 0 && box.height > 0;
        })
        .map((el) => ({
          field:
            (el as HTMLInputElement).placeholder ||
            el.getAttribute('aria-label') ||
            el.tagName.toLowerCase(),
          fontSize: parseFloat(getComputedStyle(el).fontSize),
        }))
    );
  }

  async function expectNoZoom(page: Page, where: string) {
    const fields = await fieldSizes(page);
    expect(fields.length, `${where} has no visible fields to check`).toBeGreaterThan(0);
    for (const { field, fontSize } of fields) {
      expect(fontSize, `${where}: "${field}" is ${fontSize}px, so focusing it zooms iOS in`)
        .toBeGreaterThanOrEqual(16);
    }
  }

  test('focusing the contact form does not zoom the page in', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('input[placeholder="Your name"]').scrollIntoViewIfNeeded();
    await expectNoZoom(page, 'contact form');
  });

  test('focusing the chat composer does not zoom the page in', async ({ page }) => {
    await page.goto('/ai', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('textarea')).toBeVisible();
    await expectNoZoom(page, 'chat composer');
  });

  test('focusing the command palette does not zoom the page in', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openMobileMenu(page);
    await page.locator('#mobile-menu button', { hasText: 'Search' }).click();
    await expect(page.locator('[cmdk-input]')).toBeVisible();
    await expectNoZoom(page, 'command palette');
  });

  /**
   * The button is in the server-rendered HTML, so a click can land on a real,
   * visible control before React has attached its handler and simply be
   * dropped. The open is retried rather than assumed.
   */
  async function openMobileMenu(page: Page) {
    const button = page.locator('button[aria-label="Open menu"]');
    const menu = page.locator('#mobile-menu');
    await expect(button).toBeVisible();
    await expect(async () => {
      await button.click();
      await expect(menu).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 30_000 });
  }

  /**
   * The palette's other two doors — the header Search button and Cmd-K — are
   * both desktop-only, so without an entry in the menu there is no way to
   * search from a phone at all.
   */
  test('the command palette can be opened from the menu', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openMobileMenu(page);
    await page.locator('#mobile-menu button', { hasText: 'Search' }).click();
    await expect(page.locator('[cmdk-input]')).toBeFocused();
  });

  /**
   * The menu covers the page rather than sliding it aside, so scrolling behind
   * it leaves the menu floating over unrelated content. Lenis scrolls from
   * script, which `overflow: hidden` does not prevent, so this caught a lock
   * that looked applied but did nothing.
   */
  test('the page does not scroll behind the open menu', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await openMobileMenu(page);

    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(600);
    const during = await page.evaluate(() => window.scrollY);
    expect(during, 'the page scrolled while the menu was open').toBe(before);

    // ...and scrolling comes back once the menu is dismissed.
    await page.locator('button[aria-label="Close menu"]').click();
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await page.mouse.wheel(0, 800);
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 5_000 })
      .toBeGreaterThan(before);
  });

  /** A bare arrow with no label, 16px tall, was the only way back off /ai. */
  test('the chat back link is labelled and thumb-sized', async ({ page }) => {
    await page.goto('/ai', { waitUntil: 'domcontentloaded' });
    const back = page.locator('header a[href="/"]');
    await expect(back).toContainText('Back');
    const box = await back.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(40);
  });
});

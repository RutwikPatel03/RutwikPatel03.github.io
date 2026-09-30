import { test, expect } from '@playwright/test';

/**
 * The Toolkit card in About: each skill opens the roles and projects that
 * back it up. The panel lives beside the chips on desktop and under the tapped
 * chip's group on a phone, so the visible one is the one asserted on.
 */
test.describe('toolkit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('#about h3', { hasText: 'Toolkit' }).scrollIntoViewIfNeeded();
  });

  test('picking a skill shows where it was used', async ({ page }) => {
    const chip = page.locator('#about button[data-skill="PostgreSQL"]');
    await chip.click();
    await expect(chip).toHaveAttribute('aria-pressed', 'true');

    const panel = page.locator('#about [aria-live="polite"]:visible');
    await expect(panel).toHaveCount(1);
    await expect(panel.locator('h4')).toHaveText('PostgreSQL');
    await expect(panel.getByRole('link', { name: /RoomReserve/ })).toHaveAttribute('href', '/projects/roomreserve');
  });

  /**
   * The Toolkit only lists skills something on the site backs up. A skill
   * added without a project, role or degree citing it fails here.
   */
  test('every skill listed has something behind it', async ({ page }) => {
    await expect(page.locator('#about button[data-skill]').first()).toBeVisible();
    await expect(page.locator('#about [data-unbacked]')).toHaveCount(0);
  });

  /**
   * The card clips its overflow, so a chip row or panel wider than the screen
   * gets silently cut off rather than scrolling the page.
   */
  test('nothing runs past the edge of the screen', async ({ page }) => {
    await page.locator('#about button[data-skill="LLM APIs"]').click();
    const overflowing = await page.evaluate(() =>
      [...document.querySelectorAll('#about [data-skill], #about [aria-live]')]
        .filter((el) => {
          const box = el.getBoundingClientRect();
          return box.width > 0 && box.right > window.innerWidth;
        })
        .map((el) => el.textContent?.trim().slice(0, 40))
    );
    expect(overflowing).toEqual([]);
  });
});

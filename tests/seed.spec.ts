/**
 * Seed test for Playwright Test Agents (planner / generator / healer).
 * @see https://playwright.dev/docs/test-agents
 *
 * Planner runs this seed to bootstrap page context (fixtures, base URL, dialogs).
 * Generated tests should follow the same imports and setup style.
 */
import { test, expect } from '@playwright/test';

const EXPAND_BASE =
  process.env.EXPAND_BASE_URL ||
  process.env.BASE_URL ||
  'https://practice.expandtesting.com';

test.describe('Agent seed — ExpandTesting', () => {
  test('seed', async ({ page }) => {
    // Auto-dismiss unexpected JS dialogs (matches Cucumber suite behavior)
    page.on('dialog', async (dialog) => {
      try {
        await dialog.dismiss();
      } catch {
        /* already handled */
      }
    });

    await page.goto(EXPAND_BASE, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/expandtesting\.com/i);

    // Close common overlays if present so planner starts on a clean home page
    const cookieBtn = page.locator('#js-cookie-button, .cookie-btn').first();
    if (await cookieBtn.isVisible().catch(() => false)) {
      await cookieBtn.click().catch(() => {});
    }
    const modalClose = page.locator('#exampleModal .btn-close, .modal .btn-close').first();
    if (await modalClose.isVisible().catch(() => false)) {
      await modalClose.click().catch(() => {});
    }
  });
});

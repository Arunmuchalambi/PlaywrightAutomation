/**
 * Seed test for Playwright Test Agents (planner / generator / healer).
 * @see https://playwright.dev/docs/test-agents
 *
 * Always targets ExpandTesting — do not inherit Blogspot BASE_URL from CI.
 */
import { test, expect } from '@playwright/test';

const EXPAND_BASE = process.env.EXPAND_BASE_URL || 'https://practice.expandtesting.com';

test.use({ baseURL: EXPAND_BASE });

test.describe('Agent seed — ExpandTesting @agents', () => {
  test('seed', async ({ page }) => {
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

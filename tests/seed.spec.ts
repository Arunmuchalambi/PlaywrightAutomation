/**
 * Seed for Playwright Test Agents (planner / generator / healer).
 * @see https://playwright.dev/docs/test-agents
 *
 * Blogspot practice site bootstrap for Playwright1.
 */
import { test, expect } from '@playwright/test';

const BLOGSPOT =
  process.env.BASE_URL || 'https://testautomationpractice.blogspot.com';

test.use({ baseURL: BLOGSPOT });

test.describe('Agent seed — Blogspot practice @agents', () => {
  test('seed', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      try {
        await dialog.dismiss();
      } catch {
        /* already handled */
      }
    });

    await page.goto(BLOGSPOT, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    // Ready when core form controls exist (title can flake under CDN load)
    const name = page.locator('#name');
    await expect(name).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('#email')).toBeVisible();
  });
});

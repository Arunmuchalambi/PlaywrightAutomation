// spec: specs/expand-core-journeys.md
// seed: tests/seed.spec.ts
/**
 * Sample suite produced in Playwright Test Agent generator style.
 * Always targets ExpandTesting — ignore Blogspot BASE_URL from CI.
 */
import { test, expect } from '@playwright/test';

const EXPAND_BASE = process.env.EXPAND_BASE_URL || 'https://practice.expandtesting.com';

test.use({ baseURL: EXPAND_BASE });

test.describe('ExpandTesting agent sample @agents @expand', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      try {
        await dialog.dismiss();
      } catch {
        /* already handled */
      }
    });
  });

  test('1.1 Fill and display web inputs @smoke', async ({ page }) => {
    await page.goto(`${EXPAND_BASE}/inputs`, { waitUntil: 'domcontentloaded' });

    const text = page.locator('#input-text');
    const password = page.locator('#input-password');
    const number = page.locator('#input-number');
    const date = page.locator('#input-date');
    const display = page.locator('#btn-display-inputs');

    await expect(text).toBeVisible();
    await expect(password).toBeVisible();
    await expect(number).toBeVisible();

    await text.click({ force: true });
    await text.fill('Playwright');
    await expect(text).toHaveValue('Playwright');

    await password.click({ force: true });
    await password.fill('Secret123');
    await expect(password).toHaveValue('Secret123');

    await number.click({ force: true });
    await number.fill('42');
    await expect(number).toHaveValue('42');

    await date.fill('2026-11-20').catch(() => {});
    await display.click({ force: true });

    await expect(text).toBeVisible();
    await expect(text).toHaveValue('Playwright');
    await expect(page).not.toHaveURL(/error|404/i);
  });

  test('2.1 Valid login @smoke', async ({ page }) => {
    await page.goto(`${EXPAND_BASE}/login`, { waitUntil: 'domcontentloaded' });

    await page.locator('#username').fill('practice');
    await page.locator('#password').fill('SuperSecretPassword!');
    await page.getByRole('button', { name: /Login|Log in|Sign in/i }).click();

    await expect(page.locator('body')).toContainText(/secure area|You logged into|success|Welcome/i);
  });
});

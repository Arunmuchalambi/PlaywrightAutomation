// spec: specs/blogspot-core-journeys.plan.md
// seed: tests/seed.spec.ts
/**
 * End-to-end agent loop sample for Playwright1 (Blogspot).
 * Planner plan → generator-style Playwright tests → run/heal.
 */
import { test, expect } from '@playwright/test';

const BLOGSPOT =
  process.env.BASE_URL || 'https://testautomationpractice.blogspot.com';

function todayMmDdYyyy(d = new Date()) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

test.use({ baseURL: BLOGSPOT });

test.describe('Blogspot agent E2E @agents @smoke', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      try {
        await dialog.accept();
      } catch {
        /* already handled */
      }
    });
    await page.goto(BLOGSPOT, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#name')).toBeVisible({ timeout: 20_000 });
  });

  test('1.1 Fill name, email, phone and gender', async ({ page }) => {
    await page.locator('#name').fill('Agent User');
    await page.locator('#email').fill('agent@example.com');
    await page.locator('#phone').fill('9876543210');
    await page.locator('#male').check({ force: true });

    await expect(page.locator('#name')).toHaveValue('Agent User');
    await expect(page.locator('#email')).toHaveValue('agent@example.com');
    await expect(page.locator('#phone')).toHaveValue('9876543210');
    await expect(page.locator('#male')).toBeChecked();
  });

  test('2.1 Set Date Picker 1 (mm/dd/yyyy)', async ({ page }) => {
    const today = todayMmDdYyyy();
    const dp = page.locator('#datepicker');
    await dp.click({ force: true });
    await dp.fill('');
    await dp.fill(today);
    await dp.press('Enter');
    await expect(dp).toHaveValue(today);
  });

  test('3.1 Accept simple alert', async ({ page }) => {
    const alertBtn = page.getByRole('button', { name: /^Alert$/i }).or(page.locator('#alertBtn')).first();
    await expect(alertBtn).toBeVisible();
    await alertBtn.click();
    await expect(page.locator('#name')).toBeVisible();
  });

  test('4.1 Select red and yellow colors', async ({ page }) => {
    const colors = page.locator('#colors');
    await colors.selectOption(['red', 'yellow']);
    await expect(colors).toHaveValues(['red', 'yellow']);
  });
});

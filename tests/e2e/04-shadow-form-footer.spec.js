const { test, expect } = require('@playwright/test');
const { AutomationPracticePage } = require('../../pages/AutomationPracticePage');

test.describe('Section forms, Shadow DOM, footer links', () => {
  /** @type {AutomationPracticePage} */
  let practice;

  test.beforeEach(async ({ page }) => {
    practice = new AutomationPracticePage(page);
    await practice.open();
  });

  test('section 1–3 form inputs accept values and submit', async () => {
    await expect(practice.page.locator('#para1')).toContainText('Section 1');
    await expect(practice.page.locator('#para2')).toContainText('Section 2');
    await expect(practice.page.locator('#para3')).toContainText('Section 3');
    await practice.fillSectionForms();
  });

  test('Shadow DOM: nested text, blog link, input, checkbox', async () => {
    await practice.interactWithShadowDom();
    await expect(practice.youtubeLink).toHaveAttribute('href', /youtube\.com/i);
  });

  test('footer links include Home, Hidden Elements & AJAX, Download Files', async () => {
    await expect(practice.footerLinks.filter({ hasText: 'Home' })).toBeVisible();
    await expect(practice.footerLinks.filter({ hasText: /Hidden Elements/i })).toBeVisible();
    await expect(practice.footerLinks.filter({ hasText: /Download Files/i })).toBeVisible();
  });
});

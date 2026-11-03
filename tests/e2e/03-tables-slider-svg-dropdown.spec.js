const { test, expect } = require('@playwright/test');
const { AutomationPracticePage } = require('../../pages/AutomationPracticePage');
const { MOBILE_LABELS } = require('../../fixtures/testData');

test.describe('Tables, slider, SVG, scrolling dropdown, labels', () => {
  /** @type {AutomationPracticePage} */
  let practice;

  test.beforeEach(async ({ page }) => {
    practice = new AutomationPracticePage(page);
    await practice.open();
  });

  test('dynamic web table summaries match Chrome/Firefox cell values', async () => {
    await practice.assertDynamicTableSummaries();
  });

  test('pagination web table — select products across pages', async () => {
    await practice.selectProductOnPage('Smartphone', 1);
    await practice.selectProductOnPage('Laptop', 1);
    await practice.selectProductOnPage('Television', 2);
    await expect(practice.pagination.locator('a.active')).toHaveText('2');
  });

  test('slider updates price range display', async () => {
    await practice.moveSliderHandles();
  });

  test('SVG circle, square, and triangle are visible', async () => {
    await practice.assertSvgShapesVisible();
  });

  test('scrolling dropdown selects a lazily loaded item', async () => {
    await practice.selectScrollingDropdownItem('Item 25');
  });

  test('mobile labels and laptop links are present', async () => {
    for (const label of MOBILE_LABELS) {
      await expect(practice.mobileLabels.filter({ hasText: label })).toBeVisible();
    }
    await expect(practice.laptopLinks).toHaveCount(3);
    await expect(practice.page.locator('#apple')).toHaveAttribute('href', /apple\.com/i);
    await expect(practice.page.locator('#lenovo')).toHaveAttribute('href', /lenovo\.com/i);
    await expect(practice.page.locator('#dell')).toHaveAttribute('href', /dell\.com/i);
  });
});

const { test, expect } = require('@playwright/test');
const path = require('path');
const { AutomationPracticePage } = require('../../pages/AutomationPracticePage');
const { buildUserFormData } = require('../../fixtures/testData');

/**
 * Critical user journey: one end-to-end path across the major widgets
 * (form → search → alerts → mouse → tables → shadow). Used for release gating.
 */
test.describe('Critical E2E journey @smoke @release', () => {
  test('completes full practice-site workflow', async ({ page }) => {
    const practice = new AutomationPracticePage(page);
    const data = buildUserFormData();

    await practice.open();
    await practice.fillMainForm(data);
    await practice.assertMainForm(data);

    await practice.setDatePicker1('11/03/2026');
    await practice.setDateRange('2026-11-01', '2026-11-05');
    await expect(practice.dateRangeResult).not.toHaveText('');

    await practice.searchWikipedia('Selenium');
    await practice.toggleDynamicButton();

    page.once('dialog', (d) => d.accept());
    await practice.simpleAlertBtn.click();

    await practice.hoverPointMe();
    await practice.doubleClickCopyText();
    await practice.dragAndDrop();

    const upload = path.join(__dirname, '../../fixtures/uploads/sample-a.txt');
    await practice.uploadSingleFile(upload);

    await practice.assertDynamicTableSummaries();
    await practice.selectProductOnPage('Tablet', 1);
    await practice.assertSvgShapesVisible();
    await practice.selectScrollingDropdownItem('Item 5');
    await practice.fillSectionForms();
    await practice.interactWithShadowDom();
  });
});

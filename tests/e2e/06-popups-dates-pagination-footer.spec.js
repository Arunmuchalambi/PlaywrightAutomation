const { test, expect } = require('@playwright/test');
const { AutomationPracticePage } = require('../../pages/AutomationPracticePage');

/**
 * Focused E2E for the widgets in the latest screenshot:
 * Colors, Sorted List, Date Pickers 1–3, all popups/alerts,
 * Pagination Web Table, Footer Links — one browser, sequential.
 */
test.use({ launchOptions: { slowMo: 200 } });

test.describe('Popups, dates, pagination & footer @smoke', () => {
  test('colors, sorted list, date pickers, popups, pagination table, footer', async ({
    page,
    context,
  }) => {
    const practice = new AutomationPracticePage(page);
    await practice.open();

    // —— Colors (multi-select) ——
    await practice.colorsSelect.selectOption(['red', 'yellow']);
    await expect(practice.colorsSelect).toHaveValues(['red', 'yellow']);

    // —— Sorted List (multi-select) ——
    await practice.animalsSelect.selectOption(['cheetah', 'dog']);
    await expect(practice.animalsSelect).toHaveValues(['cheetah', 'dog']);

    // —— Date Picker 1 (mm/dd/yyyy) ——
    await practice.setDatePicker1('11/03/2026');
    await expect(practice.datePicker1).toHaveValue('11/03/2026');

    // —— Date Picker 2 (dd/mm/yyyy) via calendar UI ——
    await practice.setDatePicker2ViaUi('15');
    await expect(practice.datePicker2).toHaveValue(/15/);

    // —— Date Picker 3 (date range + Submit) ——
    await practice.setDateRange('2026-11-01', '2026-11-10');
    await expect(practice.dateRangeResult).not.toHaveText('');

    // —— Confirmation Alert ——
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    await practice.confirmAlertBtn.click();

    // —— Prompt Alert ——
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('QA Engineer');
    });
    await practice.promptAlertBtn.click();

    // —— New Tab ——
    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      practice.newTabBtn.click(),
    ]);
    await newTab.waitForLoadState('domcontentloaded');
    expect(newTab.url()).toMatch(/pavantestingtools\.com/i);
    await newTab.close();

    // —— Popup Windows (Selenium + Playwright) ——
    const opened = [];
    context.on('page', (p) => opened.push(p));
    await practice.popupWindowsBtn.click();
    await expect.poll(() => opened.length).toBeGreaterThanOrEqual(2);
    await Promise.all(
      opened.map(async (p) => {
        await p.waitForLoadState('domcontentloaded').catch(() => {});
        await p.waitForURL(/selenium\.dev|playwright\.dev/i, { timeout: 20_000 }).catch(() => {});
      }),
    );
    const urls = opened.map((p) => p.url());
    expect(urls.some((u) => /selenium\.dev/i.test(u))).toBeTruthy();
    expect(urls.some((u) => /playwright\.dev/i.test(u))).toBeTruthy();
    await Promise.all(opened.map((p) => p.close().catch(() => {})));

    // —— Pagination Web Table ——
    await practice.productTable.scrollIntoViewIfNeeded();
    await practice.selectProductOnPage('Smartphone', 1);
    await practice.selectProductOnPage('Laptop', 1);
    await practice.selectProductOnPage('Television', 2);
    await expect(practice.pagination.locator('a.active')).toHaveText('2');
    await practice.pagination.locator('a').filter({ hasText: '1' }).click();
    await expect(practice.productTable.locator('tbody tr').first()).toContainText('Smartphone');

    // —— Footer Links ——
    await practice.footerLinks.first().scrollIntoViewIfNeeded();
    await expect(practice.footerLinks.filter({ hasText: 'Home' })).toBeVisible();
    await expect(practice.footerLinks.filter({ hasText: /Hidden Elements/i })).toBeVisible();
    await expect(practice.footerLinks.filter({ hasText: /Download Files/i })).toBeVisible();
    await expect(practice.footerLinks).toHaveCount(3);
  });
});

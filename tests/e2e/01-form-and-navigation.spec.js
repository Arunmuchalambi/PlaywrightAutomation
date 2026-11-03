const { test, expect } = require('@playwright/test');
const path = require('path');
const { AutomationPracticePage } = require('../../pages/AutomationPracticePage');
const {
  buildUserFormData,
  NAV_LINKS,
  STATIC_BOOKS,
} = require('../../fixtures/testData');

test.describe('Form, navigation, dates, uploads @smoke', () => {
  /** @type {AutomationPracticePage} */
  let practice;

  test.beforeEach(async ({ page }) => {
    practice = new AutomationPracticePage(page);
    await practice.open();
  });

  test('navigation menu exposes all expected links', async () => {
    await expect(practice.navLinks).toHaveCount(NAV_LINKS.length);
    for (const label of NAV_LINKS) {
      await expect(practice.navLinks.filter({ hasText: label })).toBeVisible();
    }
  });

  test('fills name, email, phone, address, gender, days, country, colors, animals', async () => {
    const data = buildUserFormData();
    await practice.fillMainForm(data);
    await practice.assertMainForm(data);
    await expect(practice.colorsSelect).toHaveValues(data.colors);
    await expect(practice.animalsSelect).toHaveValues(data.animals);
  });

  test('date pickers accept mm/dd/yyyy, dd/mm/yyyy UI pick, and date range', async () => {
    await practice.setDatePicker1('11/03/2026');
    await expect(practice.datePicker1).toHaveValue('11/03/2026');

    await practice.setDatePicker2ViaUi('15');
    await expect(practice.datePicker2).not.toHaveValue('');

    await practice.setDateRange('2026-11-01', '2026-11-10');
    await expect(practice.dateRangeResult).not.toHaveText('');
  });

  test('single and multiple file uploads', async () => {
    const uploadDir = path.join(__dirname, '../../fixtures/uploads');
    await practice.uploadSingleFile(path.join(uploadDir, 'sample-a.txt'));
    await practice.uploadMultipleFiles([
      path.join(uploadDir, 'sample-b.txt'),
      path.join(uploadDir, 'sample-c.txt'),
    ]);
  });

  test('static web table lists expected books and prices', async () => {
    for (const book of STATIC_BOOKS) {
      const row = await practice.getBookRowByName(book.bookName);
      await expect(row).toContainText(book.author);
      await expect(row).toContainText(book.subject);
      await expect(row).toContainText(book.price);
    }
  });
});

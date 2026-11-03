const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

function splitCsv(value) {
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

Given('I open the Automation Practice site', async function () {
  await this.practicePage.open();
});

When('I select colors {string}', async function (colorsCsv) {
  const colors = splitCsv(colorsCsv);
  await this.practicePage.colorsSelect.selectOption(colors);
  this.selectedColors = colors;
});

When('I select sorted list animals {string}', async function (animalsCsv) {
  const animals = splitCsv(animalsCsv);
  await this.practicePage.animalsSelect.selectOption(animals);
  this.selectedAnimals = animals;
});

Then('the colors selection should be {string}', async function (colorsCsv) {
  await expect(this.practicePage.colorsSelect).toHaveValues(splitCsv(colorsCsv));
});

Then('the sorted list selection should be {string}', async function (animalsCsv) {
  await expect(this.practicePage.animalsSelect).toHaveValues(splitCsv(animalsCsv));
});

When('I set Date Picker 1 to {string}', async function (date) {
  await this.practicePage.setDatePicker1(date);
});

When('I pick day {string} in Date Picker 2', async function (day) {
  await this.practicePage.setDatePicker2ViaUi(day);
});

When('I set date range from {string} to {string} and submit', async function (start, end) {
  await this.practicePage.setDateRange(start, end);
});

Then('Date Picker 1 should show {string}', async function (date) {
  await expect(this.practicePage.datePicker1).toHaveValue(date);
});

Then('Date Picker 2 should contain {string}', async function (fragment) {
  await expect(this.practicePage.datePicker2).toHaveValue(new RegExp(fragment));
});

Then('the date range result should not be empty', async function () {
  await expect(this.practicePage.dateRangeResult).not.toHaveText('');
});

When('I accept the Confirmation Alert', async function () {
  this.page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept();
  });
  await this.practicePage.confirmAlertBtn.click();
});

When('I accept the Prompt Alert with text {string}', async function (text) {
  this.page.once('dialog', async (dialog) => {
    expect(dialog.type()).toBe('prompt');
    await dialog.accept(text);
  });
  await this.practicePage.promptAlertBtn.click();
});

When('I open the New Tab and close it after verifying the URL', async function () {
  const [newTab] = await Promise.all([
    this.context.waitForEvent('page'),
    this.practicePage.newTabBtn.click(),
  ]);
  await newTab.waitForLoadState('domcontentloaded');
  expect(newTab.url()).toMatch(/pavantestingtools\.com/i);
  await newTab.close();
});

When('I open Popup Windows and verify Selenium and Playwright sites', async function () {
  const opened = [];
  this.context.on('page', (p) => opened.push(p));
  await this.practicePage.popupWindowsBtn.click();
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
  this.popupsOk = true;
});

Then('popup interactions should complete successfully', async function () {
  expect(this.popupsOk).toBe(true);
});

When('I select product {string} on pagination page {int}', async function (product, pageNumber) {
  await this.practicePage.productTable.scrollIntoViewIfNeeded();
  await this.practicePage.selectProductOnPage(product, pageNumber);
});

Then('pagination page {string} should be active', async function (pageNumber) {
  await expect(this.practicePage.pagination.locator('a.active')).toHaveText(pageNumber);
});

Then('Footer Links should include {string}', async function (label) {
  await this.practicePage.footerLinks.first().scrollIntoViewIfNeeded();
  await expect(this.practicePage.footerLinks.filter({ hasText: new RegExp(label, 'i') })).toBeVisible();
});

Then('Footer Links count should be {int}', async function (count) {
  await expect(this.practicePage.footerLinks).toHaveCount(count);
});

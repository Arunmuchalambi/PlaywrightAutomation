const { Given, When, Then } = require('@cucumber/cucumber');
const { expect, request } = require('@playwright/test');
const { ApiClient } = require('../api/ApiClient');
const { EXPAND_BASE } = require('../fixtures/expandRoutes');

Given('I open the ExpandTesting practice home page', async function () {
  await this.expandPage.openHome();
});

When('I open ExpandTesting practice {string} via Try it out', async function (title) {
  await this.expandPage.openTryItOut(title);
});

When('I open ExpandTesting path {string}', async function (path) {
  await this.expandPage.openPath(path);
});

When('I dismiss any unexpected ExpandTesting popups', async function () {
  await this.expandPage.dismissUnexpectedUi();
});

Then('the ExpandTesting page should load successfully for {string}', async function (path) {
  await expect(this.page).not.toHaveURL(/error|404/i);
  // Allow redirects (e.g. redirector) but page must respond
  const url = this.page.url();
  expect(url.length).toBeGreaterThan(10);
  // Soft content check — body exists
  await expect(this.page.locator('body')).toBeVisible();
  // Path should usually remain related (except redirector/oauth)
  if (!['/redirector', '/notes/app/login'].includes(path)) {
    expect(url).toContain(path.replace(/\/$/, ''));
  }
});

Then('the ExpandTesting page URL should contain {string}', async function (fragment) {
  await expect(this.page).toHaveURL(new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

Then('the ExpandTesting web inputs form should be visible', async function () {
  await this.expandPage.assertWebInputsFormVisible();
});

When(
  'I fill ExpandTesting web inputs with number {string} text {string} password {string} date {string}',
  async function (number, text, password, date) {
    await this.expandPage.fillWebInputs({ number, text, password, date });
  },
);

When(
  'I login to ExpandTesting with username {string} and password {string}',
  async function (username, password) {
    await this.expandPage.login(username, password);
  },
);

Then('I should see ExpandTesting login success', async function () {
  await expect(this.page.locator('#flash, .alert-success, .alert')).toBeVisible({ timeout: 10_000 });
  await expect(this.page.locator('body')).toContainText(/secure area|logged|success|Welcome/i);
});

Then('the ExpandTesting register form should be visible', async function () {
  await expect(this.page.locator('#username')).toBeVisible();
  await expect(this.page.locator('#password')).toBeVisible();
  await expect(this.page.locator('#confirmPassword')).toBeVisible();
});

When('I submit ExpandTesting forgot password for email {string}', async function (email) {
  await this.expandPage.submitForgotPassword(email);
});

Then('the ExpandTesting dynamic table should be visible', async function () {
  await this.expandPage.assertDynamicTableVisible();
});

Then('the ExpandTesting pagination table should be visible', async function () {
  await this.expandPage.assertPaginationTableVisible();
});

When('I exercise ExpandTesting JavaScript alert confirm and prompt', async function () {
  await this.expandPage.handleJsDialogs();
});

When('I close ExpandTesting entry ad modal if shown', async function () {
  await this.expandPage.closeEntryAdIfPresent();
});

When('I accept ExpandTesting cookie consent if shown', async function () {
  await this.expandPage.acceptCookieConsentIfPresent();
});

Given('I have an API client for ExpandTesting', async function () {
  this.apiRequest = await request.newContext({
    baseURL: EXPAND_BASE,
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: { Accept: 'application/json, text/html, */*' },
  });
  this.api = new ApiClient(this.apiRequest, EXPAND_BASE);
});

When('I GET ExpandTesting {string}', async function (path) {
  this.lastApiResponse = await this.api.get(path);
});

Then('the ExpandTesting API response status should be {int}', async function (status) {
  expect(this.lastApiResponse.status).toBe(status);
});

Then('the ExpandTesting API JSON field {string} should be {string}', async function (key, value) {
  expect(String(this.lastApiResponse.body[key])).toBe(value);
});

Then('the ExpandTesting API JSON field {string} should be true', async function (key) {
  expect(this.lastApiResponse.body[key]).toBe(true);
});

Then('the ExpandTesting API JSON should contain key {string}', async function (key) {
  expect(this.lastApiResponse.body).toHaveProperty(key);
});

Then('the ExpandTesting API body should contain {string}', async function (text) {
  expect(String(this.lastApiResponse.body)).toContain(text);
});

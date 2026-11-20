const { Given, When, Then } = require('@cucumber/cucumber');
const { expect, request } = require('@playwright/test');
const { ApiClient } = require('../api/ApiClient');
const { REST_API_BASE, SITE_BASE } = require('../fixtures/apiData');
const { BROKEN_LINK_CODES } = require('../fixtures/testData');

Given('I have an API client for the REST practice API', async function () {
  this.apiRequest = await request.newContext({
    baseURL: REST_API_BASE,
    extraHTTPHeaders: { Accept: 'application/json' },
  });
  this.api = new ApiClient(this.apiRequest, REST_API_BASE);
});

Given('I have an API client for the practice site', async function () {
  this.apiRequest = await request.newContext({
    baseURL: SITE_BASE,
    ignoreHTTPSErrors: true,
  });
  this.api = new ApiClient(this.apiRequest, SITE_BASE);
});

When('I GET {string}', async function (path) {
  this.lastApiResponse = await this.api.get(path);
});

When('I POST {string} with body:', async function (path, docString) {
  const data = JSON.parse(docString);
  this.lastApiResponse = await this.api.post(path, data, {
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  });
});

When('I PUT {string} with body:', async function (path, docString) {
  const data = JSON.parse(docString);
  this.lastApiResponse = await this.api.put(path, data, {
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  });
});

When('I DELETE {string}', async function (path) {
  this.lastApiResponse = await this.api.delete(path);
});

Then('the API response status should be {int}', async function (status) {
  expect(this.lastApiResponse.status).toBe(status);
});

Then('the API response status should be one of {string}', async function (csv) {
  const allowed = csv.split(',').map((s) => Number(s.trim()));
  expect(allowed).toContain(this.lastApiResponse.status);
});

Then('the API response JSON should contain key {string}', async function (key) {
  expect(this.lastApiResponse.body).toHaveProperty(key);
});

Then('the API response body should contain {string}', async function (text) {
  expect(String(this.lastApiResponse.body)).toContain(text);
});

When('I collect broken link hrefs from the page', async function () {
  const links = this.practicePage.brokenLinks;
  await expect(links).toHaveCount(BROKEN_LINK_CODES.length);
  this.brokenHrefs = [];
  for (let i = 0; i < BROKEN_LINK_CODES.length; i++) {
    const href = await links.nth(i).getAttribute('href');
    this.brokenHrefs.push({ href, expected: BROKEN_LINK_CODES[i] });
  }
});

Then('each broken link should return an HTTP error status', async function () {
  if (!this.api) {
    this.apiRequest = await request.newContext({ ignoreHTTPSErrors: true });
    this.api = new ApiClient(this.apiRequest);
  }

  for (const item of this.brokenHrefs) {
    const res = await this.api.get(item.href, {
      maxRedirects: 0,
      timeout: 20_000,
    });
    expect(
      res.status === item.expected || res.status >= 400 || res.status === 0,
      `${item.href} expected ~${item.expected}, got ${res.status}`,
    ).toBeTruthy();
  }
});

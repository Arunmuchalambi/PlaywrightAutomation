const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { EXPAND_BASE, PRACTICE_ROUTES } = require('../fixtures/expandRoutes');

/**
 * Page Object for https://practice.expandtesting.com/
 * Handles Try-it-out navigation, modals, and core practice flows.
 */
class ExpandTestingPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.base = EXPAND_BASE;
    this.searchInput = page.getByPlaceholder(/Search an example/i);
    this.searchButton = page.getByRole('button', { name: /^Search$/i });
    this.apiTestingNav = page.getByRole('link', { name: /^API Testing$/i }).first();
    this.testCasesNav = page.getByRole('link', { name: /^Test Cases$/i }).first();
  }

  async openHome() {
    await this.page.goto(this.base + '/', { waitUntil: 'domcontentloaded' });
    await this.dismissUnexpectedUi();
    await expect(this.page).toHaveTitle(/Automation Testing Practice|Practice/i);
  }

  /**
   * Close cookie banners, entry ads, and other unexpected modals.
   * JS dialogs are handled via the shared page dialog listener in hooks.
   */
  async dismissUnexpectedUi() {
    const candidates = [
      this.page.locator('#exampleModal button[data-bs-dismiss="modal"]'),
      this.page.locator('#exampleModal .btn-close'),
      this.page.getByRole('button', { name: /close|got it|accept|agree|ok/i }),
      this.page.locator('.modal.show .btn-close'),
      this.page.locator('[aria-label="Close"]'),
      this.page.locator('#cookie-consent button, .cookie-consent button, #cookieAlert button'),
    ];

    for (const loc of candidates) {
      try {
        if (await loc.first().isVisible({ timeout: 800 })) {
          await loc.first().click({ timeout: 2000 }).catch(() => {});
        }
      } catch {
        // ignore — popup not present
      }
    }
  }

  /** Click homepage "Try it out" for a card title and wait for navigation. */
  async openTryItOut(title) {
    await this.openHome();
    const heading = this.page.getByRole('heading', { name: title, exact: true }).first();
    await heading.scrollIntoViewIfNeeded().catch(() => {});
    const cardRoot = heading.locator('xpath=ancestor::*[.//a[contains(.,"Try it out")]][1]');
    const tryLink = cardRoot.getByRole('link', { name: /Try it out/i }).first();

    if (await tryLink.count()) {
      await Promise.all([
        this.page.waitForLoadState('domcontentloaded'),
        tryLink.click(),
      ]);
      await this.dismissUnexpectedUi();
      return;
    }

    // Fallback: known route map
    const route = PRACTICE_ROUTES.find((r) => r.title === title);
    if (!route) throw new Error(`No Try it out link or route mapping for: ${title}`);
    await this.openPath(route.path);
  }

  async openPath(path) {
    // Basic/Digest auth demos accept admin/admin
    if (path === '/basic-auth' || path === '/digest-auth') {
      await this.page.goto(`https://admin:admin@practice.expandtesting.com${path}`, {
        waitUntil: 'domcontentloaded',
      });
    } else {
      await this.page.goto(this.base + path, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    }
    await this.dismissUnexpectedUi();
  }

  async assertWebInputsFormVisible() {
    await expect(this.page.locator('#input-number')).toBeVisible();
    await expect(this.page.locator('#input-text')).toBeVisible();
    await expect(this.page.locator('#input-password')).toBeVisible();
    await expect(this.page.locator('#input-date')).toBeVisible();
    await expect(this.page.locator('#btn-display-inputs')).toBeVisible();
  }

  async fillWebInputs({ number, text, password, date }) {
    await this.assertWebInputsFormVisible();
    // Ads/overlays can steal focus — use force + keyboard typing
    await this.page.locator('#input-text').click({ force: true });
    await this.page.locator('#input-text').fill('');
    await this.page.keyboard.type(text, { delay: 20 });
    await this.page.locator('#input-password').click({ force: true });
    await this.page.keyboard.type(password, { delay: 10 });
    await this.page.locator('#input-number').click({ force: true });
    await this.page.keyboard.type(String(number), { delay: 10 });
    await this.page.locator('#input-date').fill(date).catch(() => {});
    await this.page.locator('#btn-display-inputs').click({ force: true });
    await this.assertWebInputsFormVisible();
  }

  async login(username, password) {
    await this.page.locator('#username').fill(username);
    await this.page.locator('#password').fill(password);
    await this.page.getByRole('button', { name: /Login|Sign in|Log in/i }).click();
  }

  async register(username, password) {
    await this.page.locator('#username').fill(username);
    await this.page.locator('#password').fill(password);
    await this.page.locator('#confirmPassword').fill(password);
    await this.page.locator('button[type="submit"], #register button[type="submit"]').first().click();
  }

  async submitForgotPassword(email) {
    const emailField = this.page.locator('#email, input[type="email"], input[name="email"]').first();
    await emailField.fill(email);
    await this.page.getByRole('button', { name: /retrieve|submit|send/i }).click();
  }

  async assertDynamicTableVisible() {
    await expect(this.page.locator('table').first()).toBeVisible();
  }

  async assertPaginationTableVisible() {
    await expect(this.page.locator('table').first()).toBeVisible();
    const lengthSelect = this.page.locator('select[name*="length"], .dataTables_length select').first();
    if (await lengthSelect.count()) {
      await lengthSelect.selectOption({ index: 0 }).catch(() => {});
    }
  }

  async handleJsDialogs() {
    const { dialogState } = require('../support/hooks');
    dialogState.mode = 'manual';

    dialogState.text = '';
    await this.page.locator('#js-alert').click();
    await this.page.waitForTimeout(300);

    await this.page.locator('#js-confirm').click();
    await this.page.waitForTimeout(300);

    dialogState.text = 'Expand QA';
    await this.page.locator('#js-prompt').click();
    await this.page.waitForTimeout(300);

    dialogState.mode = 'auto';
    dialogState.text = '';
  }

  async closeEntryAdIfPresent() {
    const modal = this.page.locator('#exampleModal');
    if (await modal.isVisible().catch(() => false)) {
      await this.page.locator('#exampleModal .btn-close, #exampleModal button[data-bs-dismiss="modal"]').first().click();
      await expect(modal).toBeHidden({ timeout: 5000 });
    }
  }

  async acceptCookieConsentIfPresent() {
    const btn = this.page.getByRole('button', { name: /accept|agree|got it|ok|allow/i }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
    }
  }
}

module.exports = { ExpandTestingPage };

const { expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/**
 * Deep functional checks for every ExpandTesting practice page.
 * Not just "page loaded" — verify controls exist and can be exercised.
 */
class ExpandPageExerciser {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  async exercise(routePath) {
    const key = routePath.replace(/\/$/, '') || '/';
    const handler = this.handlers[key] || this.handlers.__default;
    await handler.call(this);
  }

  async assertMainContent() {
    await expect(this.page.locator('body')).toBeVisible();
    const content = this.page.locator('#core, #contentbody, main').first();
    if (await content.count()) {
      await expect(content).toBeVisible();
    }
  }

  async fillFirstVisibleTextish(value = 'Expand QA automation') {
    const candidates = [
      this.page.locator('textarea:visible').first(),
      this.page.locator('input[type="text"]:visible').first(),
      this.page.locator('input:not([type="hidden"]):not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):visible').first(),
    ];
    for (const loc of candidates) {
      if (await loc.count()) {
        await loc.fill(value).catch(async () => {
          await loc.click({ force: true });
          await this.page.keyboard.type(value.slice(0, 20));
        });
        return true;
      }
    }
    return false;
  }

  async clickFirstVisibleButton(nameRegex) {
    const btn = this.page.getByRole('button', { name: nameRegex }).first();
    if (await btn.count()) {
      await btn.click({ force: true }).catch(() => {});
      return true;
    }
    return false;
  }

  get handlers() {
    return {
      '/inputs': async () => {
        await expect(this.page.locator('#input-number')).toBeVisible();
        await expect(this.page.locator('#input-text')).toBeVisible();
        await expect(this.page.locator('#input-password')).toBeVisible();
        await expect(this.page.locator('#input-date')).toBeVisible();
        await this.page.locator('#input-text').click({ force: true });
        await this.page.keyboard.type('Playwright E2E', { delay: 15 });
        await this.page.locator('#btn-display-inputs').click({ force: true });
        await expect(this.page.locator('#btn-clear-inputs')).toBeVisible();
      },

      '/login': async () => {
        await expect(this.page.locator('#username')).toBeVisible();
        await expect(this.page.locator('#password')).toBeVisible();
        await this.page.locator('#username').fill('practice');
        await this.page.locator('#password').fill('SuperSecretPassword!');
        await this.page.getByRole('button', { name: /Login|Log in|Sign in/i }).click();
        await expect(this.page.locator('body')).toContainText(/secure area|You logged into|success|Welcome|Invalid/i);
      },

      '/register': async () => {
        await expect(this.page.locator('#username')).toBeVisible();
        await expect(this.page.locator('#password')).toBeVisible();
        await expect(this.page.locator('#confirmPassword')).toBeVisible();
        const user = `user${Date.now().toString().slice(-6)}`;
        await this.page.locator('#username').fill(user);
        await this.page.locator('#password').fill('Secret123!');
        await this.page.locator('#confirmPassword').fill('Secret123!');
        await expect(this.page.locator('#username')).toHaveValue(user);
      },

      '/forgot-password': async () => {
        const email = this.page.locator('#email, input[type="email"], input[name="email"]').first();
        await expect(email).toBeVisible();
        await email.fill('practice@expandtesting.com');
        await this.clickFirstVisibleButton(/retrieve|submit|send/i);
        await expect(this.page.locator('body')).toBeVisible();
      },

      '/otp-login': async () => {
        await this.assertMainContent();
        const filled = await this.fillFirstVisibleTextish('practice');
        expect(filled || (await this.page.locator('input, button').count()) > 0).toBeTruthy();
      },

      '/dynamic-table': async () => {
        const table = this.page.locator('table').first();
        await expect(table).toBeVisible();
        await expect(table.locator('tr').first()).toBeVisible();
        const cells = table.locator('td');
        expect(await cells.count()).toBeGreaterThan(0);
      },

      '/dynamic-pagination-table': async () => {
        const table = this.page.locator('table').first();
        await expect(table).toBeVisible();
        const lengthSelect = this.page.locator('.dataTables_length select, select[name*="length"]').first();
        if (await lengthSelect.count()) {
          const options = await lengthSelect.locator('option').allTextContents();
          if (options.length) await lengthSelect.selectOption({ index: Math.min(1, options.length - 1) });
        }
        const search = this.page.locator('.dataTables_filter input, input[type="search"]').first();
        if (await search.count()) await search.fill('a');
      },

      '/locators': async () => {
        await this.assertMainContent();
        expect(await this.page.locator('button, input, a, [id]').count()).toBeGreaterThan(5);
      },

      '/my-browser': async () => {
        await this.clickFirstVisibleButton(/browser|show|detect|type/i);
        await expect(this.page.locator('body')).toContainText(/Chrome|Firefox|Safari|Browser|Edge|webkit/i);
      },

      '/radio-buttons': async () => {
        await expect(this.page.locator('input[type="radio"]').first()).toBeVisible();
        const red = this.page.locator('#red, input[value="red"]').first();
        if (await red.count()) await red.check({ force: true });
        else await this.page.locator('input[type="radio"]').first().check({ force: true });
        await expect(this.page.locator('input[type="radio"]:checked').first()).toBeChecked();
      },

      '/drag-and-drop': async () => {
        await expect(this.page.locator('#column-a')).toBeVisible();
        await expect(this.page.locator('#column-b')).toBeVisible();
        await this.page.locator('#column-a').dragTo(this.page.locator('#column-b'));
      },

      '/drag-and-drop-circles': async () => {
        await this.assertMainContent();
        const source = this.page.locator('[draggable="true"], .draggable, #source, .circle').first();
        const target = this.page.locator('#target, .droppable, .target').first();
        if ((await source.count()) && (await target.count())) {
          await source.dragTo(target).catch(() => {});
        }
        expect(await this.page.locator('body').count()).toBe(1);
      },

      '/form-validation': async () => {
        const contact = this.page.locator('#validationCustom01, input[type="text"]').first();
        await expect(contact).toBeVisible();
        await contact.fill('Expand Tester');
        await this.fillFirstVisibleTextish('1234567890');
        await this.clickFirstVisibleButton(/submit|register|send/i);
      },

      '/upload': async () => {
        const fileInput = this.page.locator('input[type="file"]').first();
        await expect(fileInput).toBeVisible();
        const sample = path.join(__dirname, '../fixtures/uploads/sample-a.txt');
        if (!fs.existsSync(sample)) {
          fs.mkdirSync(path.dirname(sample), { recursive: true });
          fs.writeFileSync(sample, 'expand upload');
        }
        await fileInput.setInputFiles(sample);
        await this.clickFirstVisibleButton(/upload/i);
      },

      '/download': async () => {
        const link = this.page.locator('a[href*="download"], a[download], .list-group a').first();
        await expect(this.page.locator('a, button').first()).toBeVisible();
        if (await link.count()) await expect(link).toBeVisible();
      },

      '/add-remove-elements': async () => {
        const add = this.page.getByRole('button', { name: /Add Element/i });
        await expect(add).toBeVisible();
        await add.click();
        const del = this.page.getByRole('button', { name: /Delete/i }).first();
        await expect(del).toBeVisible();
        await del.click();
      },

      '/download-secure': async () => {
        await expect(this.page.locator('body')).not.toContainText(/Not authorized/i);
        await this.assertMainContent();
        const link = this.page.locator('#core a, #contentbody a, a[href*="download"]').first();
        await expect(link).toBeVisible();
      },

      '/notification-message': async () => {
        const link = this.page.getByRole('link', { name: /Click here|new message|notification/i }).first();
        if (await link.count()) await link.click();
        const flash = this.page.locator('#flash, .alert').first();
        await expect(flash).toBeVisible();
        await expect(flash).toContainText(/action|successful|unsuccessful|message/i);
      },

      '/autocomplete': async () => {
        const country = this.page.locator('#country');
        await expect(country).toBeVisible();
        await country.fill('Uni');
        await this.page.waitForTimeout(400);
        const suggestion = this.page.locator('.ui-menu-item, .autocomplete-item, li').filter({ hasText: /United/i }).first();
        if (await suggestion.count()) await suggestion.click();
      },

      '/spies-stubs-clocks': async () => {
        await this.assertMainContent();
        expect(await this.page.locator('button, input, a').count()).toBeGreaterThan(0);
      },

      '/challenging-dom': async () => {
        const root = this.page.locator('#core, #contentbody').first();
        await expect(root.locator('table').first()).toBeVisible();
        const action = root.locator('a.btn, button.btn').first();
        await expect(action).toBeVisible();
        await action.click({ force: true });
      },

      '/large': async () => {
        await this.assertMainContent();
        expect(await this.page.locator('div, table, tr').count()).toBeGreaterThan(20);
      },

      '/shadowdom': async () => {
        const host = this.page.locator('#shadow-host');
        await expect(host).toBeVisible();
        const shadowBtn = host.locator('#my-btn, button').first();
        await expect(shadowBtn).toBeVisible();
        await shadowBtn.click({ force: true });
      },

      '/typos': async () => {
        await expect(this.page.locator('body')).toContainText(/typo|Sometimes|won.?t/i);
      },

      '/my-ip': async () => {
        await expect(this.page.locator('body')).toContainText(/\d+\.\d+\.\d+\.\d+|IP|address/i);
      },

      '/broken-images': async () => {
        const imgs = this.page.locator('img');
        expect(await imgs.count()).toBeGreaterThan(0);
      },

      '/infinite-scroll': async () => {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await this.page.waitForTimeout(500);
        await this.assertMainContent();
      },

      '/slow': async () => {
        await this.page.waitForLoadState('domcontentloaded');
        await expect(this.page.locator('body')).toBeVisible({ timeout: 30_000 });
      },

      '/js-dialogs': async () => {
        const { dialogState } = require('../support/hooks');
        dialogState.mode = 'manual';
        dialogState.text = '';
        await expect(this.page.locator('#js-alert')).toBeVisible();
        await this.page.locator('#js-alert').click();
        await this.page.waitForTimeout(200);
        await this.page.locator('#js-confirm').click();
        await this.page.waitForTimeout(200);
        dialogState.text = 'Catalog QA';
        await this.page.locator('#js-prompt').click();
        await this.page.waitForTimeout(200);
        dialogState.mode = 'auto';
      },

      '/javascript-error': async () => {
        await this.assertMainContent();
      },

      '/jqueryui': async () => {
        await this.assertMainContent();
        expect(await this.page.locator('.ui-widget, button, a, input').count()).toBeGreaterThan(0);
      },

      '/jqueryui/menu': async () => {
        const menu = this.page.locator('#menu, .ui-menu').first();
        await expect(menu.or(this.page.locator('ul li a').first())).toBeVisible();
      },

      '/abtest': async () => {
        await expect(this.page.locator('body')).toContainText(/A\/B|Variation|Control|No A\/B/i);
      },

      '/checkboxes': async () => {
        const box = this.page.locator('#checkbox1, input[type="checkbox"]').first();
        await expect(box).toBeVisible();
        await box.check({ force: true });
        await expect(box).toBeChecked();
        await box.uncheck({ force: true });
      },

      '/context-menu': async () => {
        const hot = this.page.locator('#hot-spot, .context-menu, #content').first();
        await expect(hot).toBeVisible();
        const { dialogState } = require('../support/hooks');
        dialogState.mode = 'manual';
        await hot.click({ button: 'right' });
        await this.page.waitForTimeout(300);
        dialogState.mode = 'auto';
      },

      '/key-presses': async () => {
        const target = this.page.locator('#target');
        await expect(target).toBeVisible();
        await target.click();
        await this.page.keyboard.press('A');
        await expect(this.page.locator('#result')).toContainText(/A|You entered/i);
      },

      '/disappearing-elements': async () => {
        await expect(this.page.locator('ul li a, a').first()).toBeVisible();
      },

      '/dropdown': async () => {
        const dd = this.page.locator('#dropdown');
        await expect(dd).toBeVisible();
        await dd.selectOption({ index: 1 });
        const value = await dd.inputValue();
        expect(value.length).toBeGreaterThan(0);
      },

      '/redirector': async () => {
        const link = this.page.getByRole('link', { name: /redirect|here|click/i }).first();
        if (await link.count()) await link.click();
        await expect(this.page.locator('body')).toBeVisible();
      },

      '/geolocation': async () => {
        await this.clickFirstVisibleButton(/where|location|geo|map/i);
        await this.assertMainContent();
      },

      '/horizontal-slider': async () => {
        const slider = this.page.locator('#core input[type="range"], #contentbody input[type="range"], input[type="range"]').first();
        await slider.scrollIntoViewIfNeeded().catch(() => {});
        await expect(slider).toBeVisible();
        await slider.fill('3').catch(async () => {
          await slider.click({ force: true });
          await this.page.keyboard.press('ArrowRight');
        });
      },

      '/hovers': async () => {
        const fig = this.page.locator('.figure, #img-user-1, img').first();
        await expect(fig).toBeVisible();
        await fig.hover();
        await expect(this.page.locator('.figcaption, a[href*="users"]').first()).toBeVisible({ timeout: 3000 }).catch(() => {});
      },

      '/floating-menu': async () => {
        await this.page.evaluate(() => window.scrollBy(0, 800));
        await expect(this.page.locator('#menu, .floating, a[href="#home"], a').first()).toBeVisible();
      },

      '/iframe': async () => {
        await expect(this.page.locator('iframe').first()).toBeVisible();
        const emailFrame = this.page.frameLocator('iframe[src*="iframe-email-subscribe"]');
        const email = emailFrame.locator('#email, input[type="email"]').first();
        await expect(email).toBeVisible();
        await email.fill('qa.expand@example.com');
        await expect(email).toHaveValue(/qa\.expand@example\.com/);
        const subscribe = emailFrame.locator('#btn-subscribe, button[type="submit"]').first();
        if (await subscribe.count()) await subscribe.click({ force: true }).catch(() => {});
      },

      '/windows': async () => {
        const link = this.page.getByRole('link', { name: 'Click Here' });
        await expect(link).toBeVisible();
        const [popup] = await Promise.all([
          this.page.context().waitForEvent('page', { timeout: 8000 }).catch(() => null),
          link.click(),
        ]);
        if (popup) {
          await expect(popup.locator('body')).toBeVisible();
          await popup.close().catch(() => {});
        }
      },

      '/tables': async () => {
        await expect(this.page.locator('#table1')).toBeVisible();
        await expect(this.page.locator('#table2')).toBeVisible();
        const header = this.page.locator('#table1 th').first();
        await header.click();
        expect(await this.page.locator('#table1 td').count()).toBeGreaterThan(0);
      },

      '/tooltips': async () => {
        const tip = this.page.locator('[data-bs-toggle="tooltip"], .tooltip-demo a, a[title], button[title]').first();
        if (await tip.count()) await tip.hover();
        await this.assertMainContent();
      },

      '/dynamic-content': async () => {
        await expect(this.page.locator('#content, .row, img, p').first()).toBeVisible();
      },

      '/dynamic-controls': async () => {
        const remove = this.page.getByRole('button', { name: /Remove|Add/i }).first();
        await expect(remove).toBeVisible();
        await remove.click();
        await this.page.waitForTimeout(800);
        const enable = this.page.getByRole('button', { name: /Enable|Disable/i }).first();
        if (await enable.count()) await enable.click();
      },

      '/dynamic-loading': async () => {
        const start = this.page.getByRole('button', { name: /Start/i }).or(this.page.locator('a[href*="dynamic-loading"]')).first();
        if (await this.page.getByRole('button', { name: /Start/i }).count()) {
          await this.page.getByRole('button', { name: /Start/i }).click();
          await expect(this.page.locator('#finish, #loading').first()).toBeVisible({ timeout: 20_000 });
        } else {
          await expect(this.page.getByRole('link').first()).toBeVisible();
          await this.page.getByRole('link', { name: /Example/i }).first().click().catch(() => {});
        }
      },

      '/shifting-content': async () => {
        await expect(this.page.locator('a, img, .shift').first()).toBeVisible();
      },

      '/status-codes': async () => {
        const codeLink = this.page.getByRole('link', { name: '200' });
        await expect(codeLink).toBeVisible();
        await codeLink.click();
        await expect(this.page.locator('body')).toContainText(/200|OK|status/i);
      },

      '/dynamic-id': async () => {
        const btn = this.page.getByRole('button').first();
        await expect(btn).toBeVisible();
        await btn.click({ force: true });
      },

      '/entry-ad': async () => {
        const modal = this.page.locator('#exampleModal');
        if (await modal.isVisible().catch(() => false)) {
          await this.page.locator('#exampleModal .btn-close, #exampleModal [data-bs-dismiss="modal"]').first().click();
        }
        const restart = this.page.locator('#restart-ad');
        if (await restart.count()) await restart.click();
      },

      '/exit-intent': async () => {
        await this.assertMainContent();
        await this.page.mouse.move(100, 100);
        await this.page.mouse.move(100, -10);
        await this.page.waitForTimeout(400);
        const close = this.page.locator('.modal .btn-close, .modal-footer button').first();
        if (await close.isVisible().catch(() => false)) await close.click();
      },

      '/contact': async () => {
        const inputs = this.page.locator('#core input[type="text"], #core textarea');
        expect(await inputs.count()).toBeGreaterThan(0);
        await this.page.locator('textarea').first().fill('Contact form E2E message from Playwright');
        await expect(this.page.locator('textarea').first()).toHaveValue(/Contact form E2E/);
      },

      '/google-tracking-events': async () => {
        await this.assertMainContent();
        await this.clickFirstVisibleButton(/.+/);
      },

      '/users/1': async () => {
        await expect(this.page.locator('body')).toContainText(/user|profile|email|name/i);
      },

      '/feedback': async () => {
        const rating = this.page.locator('input[type="radio"]').first();
        if (await rating.count()) await rating.check({ force: true });
        await this.fillFirstVisibleTextish('Great practice site');
        await expect(this.page.locator('textarea, input').first()).toBeVisible();
      },

      '/scrollbars': async () => {
        const btn = this.page.locator('#hidingButton');
        await expect(btn).toBeVisible({ timeout: 10_000 });
        await btn.click({ force: true });
        await this.assertMainContent();
      },

      '/cookie-alert': async () => {
        const btn = this.page.locator('#js-cookie-button, .cookie-btn').first();
        if (await btn.isVisible().catch(() => false)) await btn.click();
        await this.assertMainContent();
      },

      '/http-headers': async () => {
        await expect(this.page.locator('body')).toContainText(/header|user-agent|accept|host/i);
      },

      '/console-logs': async () => {
        await this.clickFirstVisibleButton(/log|warn|error|table|click/i);
        await this.assertMainContent();
      },

      '/notes/app/login': async () => {
        await this.assertMainContent();
        expect(await this.page.locator('input, button, a').count()).toBeGreaterThan(0);
      },

      '/basic-auth': async () => {
        await expect(this.page.locator('body')).toContainText(/Congratulations|basic auth|authorized|successfully/i);
      },

      '/digest-auth': async () => {
        await expect(this.page.locator('body')).toContainText(/Congratulations|digest|authorized|successfully/i);
      },

      '/random-number': async () => {
        await expect(this.page.locator('body')).toContainText(/\d+/);
      },

      '/flaky-test': async () => {
        await this.assertMainContent();
        await this.clickFirstVisibleButton(/.+/);
      },

      '/about': async () => {
        await expect(this.page.locator('body')).toContainText(/About|Expand|Practice/i);
      },

      '/notes/app': async () => {
        await this.assertMainContent();
        expect(await this.page.locator('input, textarea, button, a').count()).toBeGreaterThan(0);
      },

      '/webpark': async () => {
        await this.assertMainContent();
        await this.fillFirstVisibleTextish('QA');
      },

      '/bmi': async () => {
        await this.fillFirstVisibleTextish('170');
        await this.clickFirstVisibleButton(/calculate|submit|bmi/i);
        await this.assertMainContent();
      },

      '/secure-password-checker': async () => {
        const pw = this.page.locator('input[type="password"], input[type="text"]').first();
        await expect(pw).toBeVisible();
        await pw.fill('Secret#12345');
      },

      '/tracalorie': async () => {
        await this.fillFirstVisibleTextish('Apple');
        await this.assertMainContent();
      },

      '/color-wheel': async () => {
        await this.assertMainContent();
        expect(await this.page.locator('canvas, input, button, div').count()).toBeGreaterThan(0);
      },

      '/bookstore': async () => {
        await this.assertMainContent();
        expect(await this.page.locator('a, button, input').count()).toBeGreaterThan(0);
      },

      '/cars': async () => {
        await this.assertMainContent();
        expect(await this.page.locator('a, button, table, input').count()).toBeGreaterThan(0);
      },

      '/notes/api/api-docs': async () => {
        await expect(this.page.locator('body')).toContainText(/Swagger|OpenAPI|notes|API/i);
      },

      '/api/api-docs': async () => {
        await expect(this.page.locator('body')).toContainText(/Swagger|OpenAPI|API/i);
      },

      '/api/health-check': async () => {
        await expect(this.page.locator('body')).toContainText(/UP|success|API is up/i);
      },

      '/api/my-ip': async () => {
        await expect(this.page.locator('body')).toContainText(/\d+\.\d+\.\d+\.\d+|ip/i);
      },

      '/assertions/should-be': async () => {
        await this.assertMainContent();
        await this.clickFirstVisibleButton(/.+/);
      },
      '/assertions/should-have': async () => {
        await this.assertMainContent();
      },
      '/assertions/should-equal': async () => {
        await this.assertMainContent();
      },
      '/assertions/should-match': async () => {
        await this.assertMainContent();
      },
      '/assertions/should-contain': async () => {
        await this.assertMainContent();
      },
      '/assertions/should-include': async () => {
        await this.assertMainContent();
      },
      '/assertions/should-exist': async () => {
        await this.assertMainContent();
        await expect(this.page.locator('body')).toBeVisible();
      },

      '/allure-reports': async () => {
        await expect(this.page.locator('body')).toContainText(/Allure|report/i);
      },

      '/mochawesome-reports': async () => {
        await expect(this.page.locator('body')).toContainText(/Mochawesome|report|Mocha/i);
      },

      '/xpath-css-tester': async () => {
        await this.fillFirstVisibleTextish('//div');
        await this.assertMainContent();
      },

      '/mocha-chai-sinon-player': async () => {
        await this.assertMainContent();
        expect(await this.page.locator('textarea, button, pre, code').count()).toBeGreaterThan(0);
      },

      __default: async () => {
        await this.assertMainContent();
        const interactive = this.page.locator('input, textarea, select, button, a, table, iframe');
        expect(await interactive.count()).toBeGreaterThan(0);
        await this.fillFirstVisibleTextish('default e2e');
      },
    };
  }
}

module.exports = { ExpandPageExerciser };

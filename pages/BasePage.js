/**
 * Shared Page Object helpers — mirrors patterns from existing OpseraPlaywright BasePage.
 */
class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /**
   * @param {string} [path='/']
   * @param {import('@playwright/test').Page['goto'] extends (url: any, options?: infer O) => any ? O : never} [options]
   */
  async goto(path = '/', options = { waitUntil: 'domcontentloaded' }) {
    await this.page.goto(path, options);
  }

  /** @param {import('@playwright/test').Locator} locator */
  async waitVisible(locator, timeout = 15_000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }
}

module.exports = { BasePage };

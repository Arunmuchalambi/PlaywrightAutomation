const { setWorldConstructor, World } = require('@cucumber/cucumber');

/**
 * Custom World — mirrors OpseraPlaywright Cucumber world pattern.
 * Holds shared Playwright page/context and page objects per scenario.
 */
class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
    this.practicePage = null;
  }
}

setWorldConstructor(CustomWorld);

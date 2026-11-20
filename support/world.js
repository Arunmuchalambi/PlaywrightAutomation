const { setWorldConstructor, World } = require('@cucumber/cucumber');

/**
 * Custom World — mirrors OpseraPlaywright Cucumber world pattern.
 * Holds shared Playwright page/context, page objects, and API client.
 */
class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
    this.practicePage = null;
    this.apiRequest = null;
    this.api = null;
    this.lastApiResponse = null;
    this.brokenHrefs = [];
  }
}

setWorldConstructor(CustomWorld);

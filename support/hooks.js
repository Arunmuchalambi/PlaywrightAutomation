require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  Before,
  After,
  AfterStep,
  BeforeAll,
  AfterAll,
  Status,
  setDefaultTimeout,
} = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test');
const { AutomationPracticePage } = require('../pages/AutomationPracticePage');

setDefaultTimeout(120_000);

const RESULTS_DIR = path.join(process.cwd(), 'test-results');

BeforeAll(async function () {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }
  console.log('Cucumber suite starting...');
});

Before(async function () {
  const headless = this.parameters.headless !== false && process.env.HEADED !== 'true';
  const slowMo = Number(this.parameters.slowMo || process.env.SLOW_MO || 0);

  this.browser = await chromium.launch({
    headless,
    slowMo,
  });
  this.context = await this.browser.newContext({
    baseURL: this.parameters.baseURL,
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
  });
  this.page = await this.context.newPage();
  this.practicePage = new AutomationPracticePage(this.page);
});

AfterStep(async function ({ result, pickleStep }) {
  if (result.status === Status.FAILED && this.page) {
    const safeName = pickleStep.text.replace(/[^a-z0-9]+/gi, '_').slice(0, 60);
    const screenshotPath = path.join(RESULTS_DIR, `failed_${safeName}.png`);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    await this.attach(fs.readFileSync(screenshotPath), 'image/png');
  }
});

After(async function () {
  if (this.page) await this.page.close().catch(() => {});
  if (this.context) await this.context.close().catch(() => {});
  if (this.browser) await this.browser.close().catch(() => {});
});

AfterAll(async function () {
  console.log('Cucumber suite finished.');
});

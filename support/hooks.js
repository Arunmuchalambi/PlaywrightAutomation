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

/** Single shared browser + page for ALL scenarios (one window only). */
let sharedBrowser = null;
let sharedContext = null;
let sharedPage = null;

function hasBrowserTag(pickle) {
  const tags = (pickle.tags || []).map((t) => t.name);
  if (tags.includes('@rest') && !tags.includes('@broken-links') && !tags.includes('@site-http')) {
    return false;
  }
  if (tags.includes('@site-http') && !tags.includes('@broken-links')) {
    return false;
  }
  return true;
}

BeforeAll(async function () {
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  const headless = process.env.HEADED !== 'true';
  const slowMo = Number(process.env.SLOW_MO || 0);
  const baseURL = process.env.BASE_URL || 'https://testautomationpractice.blogspot.com';

  sharedBrowser = await chromium.launch({ headless, slowMo });
  sharedContext = await sharedBrowser.newContext({
    baseURL,
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
  });
  sharedPage = await sharedContext.newPage();

  console.log(
    `Cucumber suite starting — ONE shared window (${headless ? 'headless' : 'headed'})`,
  );
});

Before(async function ({ pickle }) {
  this.needsBrowser = hasBrowserTag(pickle);
  this.browser = sharedBrowser;
  this.context = sharedContext;
  this.page = sharedPage;
  this.practicePage = new AutomationPracticePage(sharedPage);

  // Close any leftover popup tabs so we stay on a single main window
  if (sharedContext) {
    const pages = sharedContext.pages();
    for (const p of pages) {
      if (p !== sharedPage && !p.isClosed()) {
        await p.close().catch(() => {});
      }
    }
  }
});

AfterStep(async function ({ result, pickleStep }) {
  if (result.status === Status.FAILED && this.page && !this.page.isClosed()) {
    const safeName = pickleStep.text.replace(/[^a-z0-9]+/gi, '_').slice(0, 60);
    const screenshotPath = path.join(RESULTS_DIR, `failed_${safeName}.png`);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    await this.attach(fs.readFileSync(screenshotPath), 'image/png');
  }
});

After(async function () {
  if (this.apiRequest) await this.apiRequest.dispose().catch(() => {});
  // Do NOT close page/context/browser here — reuse one window for all scenarios
});

AfterAll(async function () {
  if (sharedPage && !sharedPage.isClosed()) await sharedPage.close().catch(() => {});
  if (sharedContext) await sharedContext.close().catch(() => {});
  if (sharedBrowser) await sharedBrowser.close().catch(() => {});
  sharedPage = null;
  sharedContext = null;
  sharedBrowser = null;
  console.log('Cucumber suite finished — shared window closed.');
});

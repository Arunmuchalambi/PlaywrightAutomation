// @ts-check
require('dotenv').config();
const { defineConfig, devices } = require('@playwright/test');

const isCI = !!process.env.CI;

/**
 * Senior QA Playwright config: parallel runs, traces, screenshots,
 * video on failure, and multi-browser coverage for CI release gating.
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: isCI ? 4 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['json', { outputFile: 'test-results/playwright-results.json' }],
        ['github'],
      ]
    : [
        ['list'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/playwright-results.json' }],
      ],
  use: {
    baseURL: process.env.BASE_URL || 'https://testautomationpractice.blogspot.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.js$/,
      use: {
        baseURL: process.env.BASE_URL || 'https://testautomationpractice.blogspot.com',
      },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/tests\/api\/rest-crud\.spec\.js$/],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: [/tests\/api\//],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: [/tests\/api\//],
    },
  ],
  // Keep artifacts out of test-results/ so report history + index.html are not wiped
  outputDir: 'test-results/playwright-artifacts',
});

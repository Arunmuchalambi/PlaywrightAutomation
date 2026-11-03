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
        ['json', { outputFile: 'test-results/results.json' }],
        ['github'],
      ]
    : [
        ['list'],
        ['html', { open: 'on-failure', outputFolder: 'playwright-report' }],
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
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: [/broken-links\.spec\.js$/],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: [/broken-links\.spec\.js$/],
    },
  ],
  outputDir: 'test-results',
});

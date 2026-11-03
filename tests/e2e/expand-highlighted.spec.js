const { test, expect } = require('@playwright/test');
const { ExpandTestingPage } = require('../../pages/ExpandTestingPage');
const { HIGHLIGHTED_ROUTES, PRACTICE_ROUTES } = require('../../fixtures/expandRoutes');

test.describe('ExpandTesting E2E @expand @smoke', () => {
  test.use({
    baseURL: 'https://practice.expandtesting.com',
    httpCredentials: { username: 'admin', password: 'admin' },
  });

  test.beforeEach(async ({ page }) => {
    // Auto-dismiss unexpected dialogs
    page.on('dialog', async (d) => {
      try {
        await d.dismiss();
      } catch {
        await d.accept().catch(() => {});
      }
    });
  });

  test('highlighted Try it out journeys in one browser', async ({ page }) => {
    const expand = new ExpandTestingPage(page);
    await expand.openHome();

    for (const route of HIGHLIGHTED_ROUTES) {
      await expand.openPath(route.path);
      await expand.dismissUnexpectedUi();
      await expect(page.locator('body')).toBeVisible();
      expect(page.url()).toContain(route.path.replace(/\/$/, ''));
    }

    await expand.openPath('/inputs');
    await expand.fillWebInputs({
      number: 7,
      text: 'Expand',
      password: 'Pw123!',
      date: '2026-11-03',
    });

    await expand.openPath('/login');
    await expand.login('practice', 'SuperSecretPassword!');
    await expect(page.locator('body')).toContainText(/secure area|logged|success|Welcome/i);
  });

  test('catalog deep E2E — exercise controls on every practice path', async ({ page }) => {
    test.setTimeout(600_000);
    const expand = new ExpandTestingPage(page);
    const { ExpandPageExerciser } = require('../../pages/ExpandPageExerciser');
    const exerciser = new ExpandPageExerciser(page);

    for (const route of PRACTICE_ROUTES) {
      await expand.openPath(route.path);
      await expand.dismissUnexpectedUi();
      await expect(page.locator('body')).toBeVisible();
      await exerciser.exercise(route.path);
    }
  });
});

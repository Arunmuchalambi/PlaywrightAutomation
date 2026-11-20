const { test, expect } = require('@playwright/test');
const { AutomationPracticePage } = require('../../pages/AutomationPracticePage');

test.describe('Alerts, popups, mouse actions, wiki, dynamic button', () => {
  /** @type {AutomationPracticePage} */
  let practice;

  test.beforeEach(async ({ page }) => {
    practice = new AutomationPracticePage(page);
    await practice.open();
  });

  test('Wikipedia search returns results', async () => {
    await practice.searchWikipedia('Playwright');
    await expect(practice.wikiResults.locator('a').first()).toBeVisible();
  });

  test('dynamic START button toggles label', async () => {
    await expect(practice.dynamicButton).toHaveText(/START/i);
    const after = await practice.toggleDynamicButton();
    expect(after.toUpperCase()).toContain('STOP');
    await practice.toggleDynamicButton();
    await expect(practice.dynamicButton).toHaveText(/START/i);
  });

  test('simple alert accepts dialog', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toMatch(/alert/i);
      await dialog.accept();
    });
    await practice.simpleAlertBtn.click();
  });

  test('confirmation alert can be dismissed', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });
    await practice.confirmAlertBtn.click();
  });

  test('prompt alert accepts custom text', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('Senior QA');
    });
    await practice.promptAlertBtn.click();
  });

  test('New Tab opens pavantestingtools', async ({ context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      practice.newTabBtn.click(),
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    expect(newPage.url()).toMatch(/pavantestingtools\.com/i);
    await newPage.close();
  });

  test('Popup Windows open Selenium and Playwright sites', async ({ context }) => {
    const opened = [];
    context.on('page', (p) => opened.push(p));

    await practice.popupWindowsBtn.click();
    await expect.poll(() => opened.length).toBeGreaterThanOrEqual(2);

    await Promise.all(
      opened.map(async (p) => {
        await p.waitForLoadState('domcontentloaded').catch(() => {});
        await p.waitForURL(/selenium\.dev|playwright\.dev/i, { timeout: 20_000 }).catch(() => {});
      }),
    );

    const urls = opened.map((p) => p.url());
    expect(urls.some((u) => /selenium\.dev/i.test(u))).toBeTruthy();
    expect(urls.some((u) => /playwright\.dev/i.test(u))).toBeTruthy();
    await Promise.all(opened.map((p) => p.close().catch(() => {})));
  });

  test('mouse hover reveals Mobiles and Laptops menu', async () => {
    await practice.hoverPointMe();
    await expect(practice.hoverMenu.getByText('Mobiles')).toBeVisible();
    await expect(practice.hoverMenu.getByText('Laptops')).toBeVisible();
  });

  test('double click copies Field1 into Field2', async () => {
    await practice.doubleClickCopyText();
  });

  test('drag source onto drop target', async () => {
    await practice.dragAndDrop();
  });
});

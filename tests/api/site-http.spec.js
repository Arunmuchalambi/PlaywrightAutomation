const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../api/ApiClient');
const { SITE_BASE } = require('../../fixtures/apiData');
const { AutomationPracticePage } = require('../../pages/AutomationPracticePage');

test.describe('Practice site HTTP / API integration @api', () => {
  test('homepage returns 200 and HTML content-type', async ({ request }) => {
    const api = new ApiClient(request, SITE_BASE);
    const res = await api.get('/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type'] || '').toMatch(/text\/html/i);
    expect(String(res.body)).toMatch(/Automation Testing Practice/i);
    expect(res.elapsedMs).toBeLessThan(15_000);
  });

  test('footer and laptop link targets respond successfully', async ({ page, request }) => {
    const practice = new AutomationPracticePage(page);
    await practice.open();

    const hrefs = [
      ...(await practice.footerLinks.evaluateAll((els) => els.map((e) => e.href))),
      ...(await practice.laptopLinks.evaluateAll((els) => els.map((e) => e.href))),
    ];

    expect(hrefs.length).toBeGreaterThan(0);
    const api = new ApiClient(request);

    for (const href of hrefs) {
      const res = await api.get(href, { timeout: 20_000, maxRedirects: 5 });
      expect(res.status, href).toBeGreaterThanOrEqual(200);
      expect(res.status, href).toBeLessThan(400);
    }
  });

  test('Wikipedia search triggers a network response', async ({ page }) => {
    const practice = new AutomationPracticePage(page);
    await practice.open();

    const responsePromise = page.waitForResponse(
      (res) => /wikipedia/i.test(res.url()) && res.status() < 500,
      { timeout: 20_000 },
    );

    await practice.wikiSearchInput.fill('Playwright');
    await practice.wikiSearchButton.click();
    const wikiResponse = await responsePromise;

    expect(wikiResponse.ok() || wikiResponse.status() === 200).toBeTruthy();
    await expect(practice.wikiResults.locator('a').first()).toBeVisible({ timeout: 15_000 });
  });
});

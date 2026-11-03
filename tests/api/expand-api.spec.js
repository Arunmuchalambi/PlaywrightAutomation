const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../api/ApiClient');
const { EXPAND_BASE } = require('../../fixtures/expandRoutes');

test.describe('ExpandTesting REST API @api @expand', () => {
  /** @type {ApiClient} */
  let api;

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request, EXPAND_BASE);
  });

  test('GET /api/health-check returns UP', async () => {
    const res = await api.get('/api/health-check');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ success: true, status: 'UP' });
  });

  test('GET /api/my-ip/ returns IP payload', async () => {
    const res = await api.get('/api/my-ip/');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('ip');
  });

  test('Swagger docs for Notes and Practice APIs return 200', async () => {
    const notes = await api.get('/notes/api/api-docs/');
    const practice = await api.get('/api/api-docs/');
    expect(notes.status).toBe(200);
    expect(practice.status).toBe(200);
  });

  test('UI pages return 200 for login and inputs', async () => {
    const home = await api.get('/');
    const login = await api.get('/login');
    const inputs = await api.get('/inputs');
    expect(home.status).toBe(200);
    expect(login.status).toBe(200);
    expect(inputs.status).toBe(200);
    expect(String(home.body)).toMatch(/Automation Testing Practice/i);
  });
});

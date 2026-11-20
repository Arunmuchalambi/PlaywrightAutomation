const { test, expect } = require('@playwright/test');
const { ApiClient } = require('../../api/ApiClient');
const { REST_API_BASE, NEW_POST, UPDATED_POST } = require('../../fixtures/apiData');

/**
 * REST API CRUD against JSONPlaceholder — standard public practice API
 * for GET/POST/PUT/PATCH/DELETE contract checks (no browser required).
 */
test.describe('REST API CRUD (JSONPlaceholder) @api', () => {
  /** @type {ApiClient} */
  let api;

  test.beforeEach(async ({ request }) => {
    api = new ApiClient(request, REST_API_BASE);
  });

  test('GET /posts returns a list of posts', async () => {
    const res = await api.get('/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('title');
  });

  test('GET /posts/1 returns a single post schema', async () => {
    const res = await api.get('/posts/1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      userId: expect.any(Number),
      id: 1,
      title: expect.any(String),
      body: expect.any(String),
    });
  });

  test('POST /posts creates a resource (201)', async () => {
    const res = await api.post('/posts', NEW_POST, {
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: NEW_POST.title,
      body: NEW_POST.body,
      userId: NEW_POST.userId,
      id: expect.any(Number),
    });
  });

  test('PUT /posts/1 replaces a resource', async () => {
    const res = await api.put('/posts/1', UPDATED_POST, {
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      title: UPDATED_POST.title,
      body: UPDATED_POST.body,
    });
  });

  test('PATCH /posts/1 partially updates a resource', async () => {
    const res = await api.patch(
      '/posts/1',
      { title: 'Patched title' },
      { headers: { 'Content-Type': 'application/json; charset=UTF-8' } },
    );
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Patched title');
    expect(res.body.id).toBe(1);
  });

  test('DELETE /posts/1 returns success', async () => {
    const res = await api.delete('/posts/1');
    expect([200, 204]).toContain(res.status);
  });

  test('GET /posts/999999 returns 404 for missing resource', async () => {
    const res = await api.get('/posts/999999');
    expect(res.status).toBe(404);
  });

  test('GET /users/1/posts filters nested resources', async () => {
    const res = await api.get('/users/1/posts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    for (const post of res.body) {
      expect(post.userId).toBe(1);
    }
  });
});

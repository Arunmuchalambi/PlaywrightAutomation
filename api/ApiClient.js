/**
 * Lightweight API client built on Playwright's request context.
 * Used for REST CRUD, site HTTP checks, and integration assertions.
 */
class ApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   * @param {string} [baseURL]
   */
  constructor(request, baseURL = '') {
    this.request = request;
    this.baseURL = baseURL.replace(/\/$/, '');
  }

  /** @param {string} path */
  url(path) {
    if (/^https?:\/\//i.test(path)) return path;
    return `${this.baseURL}${path.startsWith('/') ? path : `/${path}`}`;
  }

  /**
   * @param {string} method
   * @param {string} path
   * @param {import('@playwright/test').APIRequestContext['fetch'] extends (url: any, options?: infer O) => any ? O : never} [options]
   */
  async send(method, path, options = {}) {
    const started = Date.now();
    const response = await this.request.fetch(this.url(path), {
      method,
      failOnStatusCode: false,
      ...options,
    });
    const elapsedMs = Date.now() - started;
    let body = null;
    const contentType = response.headers()['content-type'] || '';
    try {
      body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();
    } catch {
      body = null;
    }
    return {
      status: response.status(),
      ok: response.ok(),
      headers: response.headers(),
      body,
      elapsedMs,
      response,
    };
  }

  get(path, options) {
    return this.send('GET', path, options);
  }

  post(path, data, options = {}) {
    return this.send('POST', path, { ...options, data });
  }

  put(path, data, options = {}) {
    return this.send('PUT', path, { ...options, data });
  }

  patch(path, data, options = {}) {
    return this.send('PATCH', path, { ...options, data });
  }

  delete(path, options) {
    return this.send('DELETE', path, options);
  }
}

module.exports = { ApiClient };

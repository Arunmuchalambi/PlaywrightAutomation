const REST_API_BASE = process.env.REST_API_BASE || 'https://jsonplaceholder.typicode.com';
const SITE_BASE = process.env.BASE_URL || 'https://testautomationpractice.blogspot.com';

const NEW_POST = {
  title: 'Playwright API automation',
  body: 'Created by Senior QA E2E/API suite',
  userId: 1,
};

const UPDATED_POST = {
  id: 1,
  title: 'Updated by Playwright',
  body: 'PATCH/PUT validation',
  userId: 1,
};

module.exports = {
  REST_API_BASE,
  SITE_BASE,
  NEW_POST,
  UPDATED_POST,
};

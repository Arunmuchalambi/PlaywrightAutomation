---
agent: playwright-test-generator
description: Generate ExpandTesting Playwright tests
---

Generate Playwright tests from the Markdown plan.

- Plan: `specs/expand-coverage.plan.md`
- Seed: `tests/seed.spec.ts`
- Output under `tests/e2e/` as `*.spec.js` or `*.spec.ts`
- Match existing project style (Page objects under `pages/` when reuse helps)
- Use `baseURL` / ExpandTesting URLs; dismiss unexpected dialogs like the seed

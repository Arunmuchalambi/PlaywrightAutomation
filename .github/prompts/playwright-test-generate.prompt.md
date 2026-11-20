---
agent: playwright-test-generator
description: Generate Blogspot Playwright tests from plan
---

Generate Playwright tests from `specs/blogspot-core-journeys.plan.md`.

- Seed: `tests/seed.spec.ts`
- Output: `tests/e2e/blogspot-agent-generated.spec.ts`
- Prefer `#id` locators used by existing Page Objects

# Specs — Playwright Test Agent plans

Markdown test plans consumed by the **🎭 generator** agent.

Official docs: [Playwright Test Agents](https://playwright.dev/docs/test-agents)

| File | Purpose |
|------|---------|
| `expand-coverage.plan.md` | **Planner output** — full coverage plan (forms, auth, tables, dialogs, overlays, upload) |
| `expand-core-journeys.md` | Starter core journeys (inputs, login, table, dialogs) |

## How to use (Cursor / VS Code)

1. Ensure MCP server `playwright-test` is available (see `.vscode/mcp.json`).
2. **Planner** — explore the app using seed `tests/seed.spec.ts`, save a plan under `specs/`.
3. **Generator** — point at a plan in `specs/` and generate Playwright tests under `tests/`.
4. **Healer** — give a failing test name; agent repairs locators/waits until green.

Prompts live in `.github/prompts/`. Agent definitions live in `.github/agents/`.

Regenerate agent definitions after upgrading Playwright:

```bash
npm run agents:init
```

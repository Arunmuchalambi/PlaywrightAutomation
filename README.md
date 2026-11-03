# Playwright Automation Practice (JavaScript)

End-to-end Playwright project for [testautomationpractice.blogspot.com](https://testautomationpractice.blogspot.com/), built from scratch with Page Object Model patterns aligned to the existing OpseraPlaywright layout (`pages/`, fixtures, CI reporters).

## What this covers

| Area | Coverage |
|------|----------|
| Form | Name, Email, Phone, Address, Gender, Days, Country, Colors, Sorted List |
| Dates | Date Picker 1/2, date range + Submit |
| Sidebar | Wikipedia search, Dynamic START/STOP, Alerts, New Tab, Popups |
| Mouse | Hover (Point Me), Double-click Copy Text, Drag & Drop |
| Files | Single + multiple upload |
| Tables | Static books, Dynamic CPU/Memory asserts, Pagination + checkboxes |
| Widgets | Slider, SVG shapes, Scrolling dropdown, Labels/Links |
| Advanced | Shadow DOM (nested), Section forms, Footer links, Broken-link HTTP checks |

## Quick start

```bash
npm install
npx playwright install
cp .env.example .env
npm test -- --project=chromium
```

Useful scripts:

```bash
npm run test:headed      # headed Chromium
npm run test:smoke       # @smoke tagged tests
npm run test:parallel    # 4 workers
npm run report           # open HTML report
npm run codegen          # record against the practice site
```

## Project layout (Cucumber BDD + Playwright)

Aligned with OpseraPlaywright structure:

```
features/              # Gherkin Feature files
stepdefinitions/       # Step Definitions
pages/                 # Page Objects (BasePage + AutomationPracticePage)
support/               # Cucumber World + Hooks
fixtures/              # test data + upload files
tests/e2e/             # Optional Playwright-native .spec.js suite
tests/api/             # broken-link status checks
cucumber.js            # Cucumber runner config
.github/workflows/     # CI + release gate
```

### Run Cucumber (Feature → Steps → Pages)

```bash
npm run cucumber:headed          # all features, headed browser
npm run cucumber:journey         # screenshot widgets journey only
npm run cucumber:api             # REST + site HTTP API features
npm run cucumber:smoke           # @smoke tagged scenarios
```

### API testing

```bash
npm run test:api                 # Playwright API project (REST CRUD + site HTTP)
npm run cucumber:api             # Same coverage via Feature files
```

### Overall report (UI + API) — Opsera-style dashboard

```bash
npm run report:all               # Run UI + API, archive history, build dashboard
npm run report:generate          # Rebuild test-results/index.html from archived runs
npm run report:open              # Open file://.../test-results/index.html
```

Dashboard structure:

```
test-results/
  index.html                 ← Overall UI + API summary (like Opsera)
  overall-summary.json
  cucumber-report.html
  history/
    runs.json
    <timestamp>__ui-.../
    <timestamp>__api-.../
```

- `api/ApiClient.js` — reusable Playwright request wrapper  
- `tests/api/rest-crud.spec.js` — GET/POST/PUT/PATCH/DELETE (JSONPlaceholder)  
- `tests/api/site-http.spec.js` — homepage, footer/laptop links, Wikipedia network  
- `tests/api/broken-links.spec.js` — Errorcode 400–503 status checks  
- `features/api_testing.feature` — BDD API scenarios

## Flake reduction

- `trace: on-first-retry`, screenshots/video on failure
- CI retries (`retries: 2`) and JUnit/HTML/GitHub reporters for gating
- Stable locators (`#id`, roles) over brittle CSS where possible
- Network assertions for broken links without full browser navigation

## Branch

Feature work lives on **`Playwright1`** (created from `main`).

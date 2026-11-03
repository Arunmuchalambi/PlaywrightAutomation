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

## Project layout

```
pages/           # BasePage + AutomationPracticePage (POM)
fixtures/        # test data + upload files
tests/e2e/       # UI journeys
tests/api/       # broken-link status checks via request API
.github/workflows/playwright.yml  # parallel CI + release gate
```

## Flake reduction

- `trace: on-first-retry`, screenshots/video on failure
- CI retries (`retries: 2`) and JUnit/HTML/GitHub reporters for gating
- Stable locators (`#id`, roles) over brittle CSS where possible
- Network assertions for broken links without full browser navigation

## Branch

Feature work lives on **`Playwright1`** (created from `main`).

# ExpandTesting Practice Site — Coverage Test Plan

> Generated in **Playwright Test Agent 🎭 planner** style  
> **Seed:** `tests/seed.spec.ts`  
> **App:** https://practice.expandtesting.com  
> **Explored:** home “Try it out” catalog + live probes of `/inputs`, `/login`, `/register`, `/dynamic-table`, `/js-dialogs`, `/checkboxes`, `/dropdown`, `/upload`, `/contact`, `/entry-ad`  
> **Assumptions:** each scenario starts from a fresh browser context (or cleared cookies); dismiss unexpected JS dialogs; ads/overlays may steal focus — prefer `force` clicks and value asserts after fill.

---

## Application Overview

ExpandTesting is a public automation practice platform. The home page lists many practice cards; each card exposes a **Try it out** link into a self-contained demo (forms, auth, tables, dialogs, DOM challenges, APIs).

**Primary user journeys covered in this plan**
1. Form input & display  
2. Authentication (login / register / negative login)  
3. Dynamic data tables  
4. Native JavaScript dialogs  
5. Overlays (entry ad / cookie)  
6. Common controls (checkbox, dropdown, upload)  
7. Contact textarea messaging  

**Known risks for automation**
- Third-party ads can overlay controls or steal focus  
- Entry Ad modal (`#close-modal-btn` / `.btn-close`) may block interaction  
- Secure download / basic auth require `admin:admin` HTTP credentials  

---

## Test Scenarios

### 1. Web inputs

**Seed:** `tests/seed.spec.ts`  
**Route:** `/inputs`

#### 1.1 Fill all input types and display values

**Steps:**
1. Navigate to `/inputs` (or home → card **Web inputs** → **Try it out**)
2. Locate `#input-text`, `#input-password`, `#input-number`, `#input-date`
3. Fill text with `Playwright Agent`
4. Fill password with `Secret123`
5. Fill number with `42`
6. Fill date with `2026-11-20` if the control accepts keyboard/date fill
7. Click button **Display Inputs** (`#btn-display-inputs`)

**Expected Results:**
- All four inputs remain visible
- `#input-text` has value `Playwright Agent`
- `#input-password` has value `Secret123`
- `#input-number` has value `42`
- Page does not navigate to an error URL

#### 1.2 Clear inputs after display

**Steps:**
1. Complete scenario 1.1 (or fill any values)
2. Click **Clear Inputs** (`#btn-clear-inputs`)

**Expected Results:**
- Text / password / number fields are empty (or reset per app behavior)
- Display / Clear buttons remain enabled and visible

#### 1.3 Empty display does not crash

**Steps:**
1. Open `/inputs` with empty fields
2. Click **Display Inputs**

**Expected Results:**
- Page stays on `/inputs`
- No uncaught error overlay; form still usable

---

### 2. Login

**Seed:** `tests/seed.spec.ts`  
**Route:** `/login`

#### 2.1 Valid login (happy path)

**Steps:**
1. Navigate to `/login`
2. Fill `#username` with `practice`
3. Fill `#password` with `SuperSecretPassword!`
4. Click **Login** (`#submit-login` or role=button name Login)

**Expected Results:**
- Body or flash contains success / secure-area messaging (e.g. “You logged into a secure area”)
- User lands on authenticated view (URL often contains `/secure`)

#### 2.2 Invalid login (negative)

**Steps:**
1. Navigate to `/login`
2. Fill `#username` with `wrong-user`
3. Fill `#password` with `wrong-pass`
4. Click **Login**

**Expected Results:**
- Error / invalid credentials messaging is shown
- User is not treated as successfully authenticated

#### 2.3 Blank credentials submit

**Steps:**
1. Open `/login`
2. Leave username and password empty
3. Click **Login**

**Expected Results:**
- Validation or error feedback appears, or login is rejected
- No successful secure-area message

---

### 3. Register

**Seed:** `tests/seed.spec.ts`  
**Route:** `/register`

#### 3.1 Register form is present and fillable

**Steps:**
1. Navigate to `/register`
2. Verify `#username`, `#password`, `#confirmPassword` are visible
3. Fill username with a unique value e.g. `agent` + timestamp
4. Fill password and confirm password with `Secret123!`
5. Click **Register**

**Expected Results:**
- Form accepts input without client crash
- Success message, redirect, or validation feedback appears (assert whichever the app returns)

#### 3.2 Mismatched confirm password

**Steps:**
1. Open `/register`
2. Fill username `agent-mismatch`
3. Fill password `Secret123!`
4. Fill confirmPassword `Different999!`
5. Click **Register**

**Expected Results:**
- Registration is rejected or validation error is shown
- User is not silently registered as authenticated without feedback

---

### 4. Dynamic table

**Seed:** `tests/seed.spec.ts`  
**Route:** `/dynamic-table`

#### 4.1 Table loads with data rows

**Steps:**
1. Navigate to `/dynamic-table`
2. Locate the main practice table (within `#core` / main content)

**Expected Results:**
- At least one table is visible
- At least one data row (non-header) is present

#### 4.2 Dynamic pagination table loads

**Steps:**
1. Navigate to `/dynamic-pagination-table`
2. Observe table and pagination controls

**Expected Results:**
- Table is visible
- Pagination or page-size controls are present when data spans pages

---

### 5. JavaScript dialogs

**Seed:** `tests/seed.spec.ts`  
**Route:** `/js-dialogs`

#### 5.1 Js Alert

**Steps:**
1. Navigate to `/js-dialogs`
2. Click **Js Alert** (`#js-alert`)
3. Accept the dialog

**Expected Results:**
- Dialog appears and can be accepted
- Page remains on `/js-dialogs` and is interactive

#### 5.2 Js Confirm

**Steps:**
1. On `/js-dialogs`, click **Js Confirm** (`#js-confirm`)
2. Accept (or dismiss) the confirm dialog

**Expected Results:**
- Dialog is handled without hanging the page
- Result text (if shown) updates accordingly

#### 5.3 Js Prompt with text

**Steps:**
1. On `/js-dialogs`, click **Js Prompt** (`#js-prompt`)
2. Enter `Agent QA` into the prompt and accept

**Expected Results:**
- Prompt accepts the typed value
- Page shows the entered value in a result area when the demo provides one

---

### 6. Unexpected overlays

**Seed:** `tests/seed.spec.ts`

#### 6.1 Entry Ad can be closed

**Steps:**
1. Navigate to `/entry-ad`
2. If modal is visible, click **Close** (`#close-modal-btn`) or `.btn-close`
3. Optionally click restart-ad control if present and close again

**Expected Results:**
- Modal is dismissed
- Main page content is interactable

#### 6.2 Cookie consent can be accepted

**Steps:**
1. Navigate to `/cookie-alert` (or home if banner shows)
2. Click cookie accept / `#js-cookie-button` when visible

**Expected Results:**
- Banner is dismissed or no longer blocking primary content

---

### 7. Checkboxes

**Seed:** `tests/seed.spec.ts`  
**Route:** `/checkboxes`

#### 7.1 Check and uncheck

**Steps:**
1. Navigate to `/checkboxes`
2. Check `#checkbox1` (force if needed)
3. Assert checked
4. Uncheck `#checkbox1`
5. Assert unchecked
6. Toggle `#checkbox2` similarly

**Expected Results:**
- Checkbox checked state matches actions
- No page error

---

### 8. Dropdown list

**Seed:** `tests/seed.spec.ts`  
**Route:** `/dropdown`

#### 8.1 Select a simple option

**Steps:**
1. Navigate to `/dropdown`
2. On `#dropdown`, select Option 1 (index 1 or label)
3. Read selected value

**Expected Results:**
- Selected value is non-empty and matches the chosen option

#### 8.2 Country select is usable

**Steps:**
1. On `/dropdown`, open `#country`
2. Select a country (e.g. first non-placeholder option)

**Expected Results:**
- Country select retains a real country value

---

### 9. File upload

**Seed:** `tests/seed.spec.ts`  
**Route:** `/upload`

#### 9.1 Upload a small text file

**Steps:**
1. Navigate to `/upload`
2. Set `#fileInput` to a local sample file (e.g. `fixtures/uploads/sample-a.txt`)
3. Click **Upload** (`#fileSubmit`)

**Expected Results:**
- Upload completes without 5xx error page
- Success / filename feedback appears when provided by the app

---

### 10. Contact form (textarea)

**Seed:** `tests/seed.spec.ts`  
**Route:** `/contact`

#### 10.1 Fill contact message textarea

**Steps:**
1. Navigate to `/contact`
2. Locate visible text inputs and textarea in main content
3. Fill textarea with `Contact form E2E message from Playwright Agent`
4. Optionally fill name/email fields if present

**Expected Results:**
- Textarea retains the typed message
- Form remains visible (submit optional unless button is clearly available)

---

### 11. Home catalog navigation smoke

**Seed:** `tests/seed.spec.ts`  
**Route:** `/`

#### 11.1 Open Try it out for a highlighted card

**Steps:**
1. Open home page
2. Find card titled **Web inputs**
3. Click **Try it out**
4. Wait for navigation

**Expected Results:**
- URL contains `/inputs`
- Web inputs form (`#input-text`) is visible

---

## Out of scope (follow-up plans)

- Full 74+ Try-it-out deep functional matrix (already covered by Cucumber `@catalog` + `ExpandPageExerciser`)
- OAuth providers / Notes React app deep flows
- Visual / accessibility audits

---

## Generator hints

| Scenario | Preferred locators |
|----------|-------------------|
| Web inputs | `#input-text`, `#input-password`, `#input-number`, `#input-date`, `#btn-display-inputs`, `#btn-clear-inputs` |
| Login | `#username`, `#password`, `#submit-login` |
| Register | `#username`, `#password`, `#confirmPassword`, getByRole button Register |
| Dialogs | `#js-alert`, `#js-confirm`, `#js-prompt` |
| Entry ad | `#close-modal-btn` |
| Upload | `#fileInput`, `#fileSubmit` |
| Checkboxes | `#checkbox1`, `#checkbox2` |
| Dropdown | `#dropdown`, `#country` |

**Output target for 🎭 generator:** `tests/e2e/expand-agent-generated.spec.ts` (or split per section under `tests/e2e/agents/`).

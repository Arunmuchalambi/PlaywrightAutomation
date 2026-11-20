# ExpandTesting Practice Site — Core Journeys Test Plan

## Application Overview

[practice.expandtesting.com](https://practice.expandtesting.com) is a public automation practice site with many “Try it out” demos (forms, auth, tables, dialogs, iframes, APIs).

**Seed:** `tests/seed.spec.ts`  
**Base URL:** `https://practice.expandtesting.com`

Key areas for this plan:
- Web inputs (number, text, password, date)
- Login / secure area
- Dynamic table
- JavaScript dialogs
- Cookie consent / entry ad dismissal

---

## Test Scenarios

### 1. Web inputs

**Seed:** `tests/seed.spec.ts`

#### 1.1 Fill and display web inputs

**Steps:**
1. From home, open **Web inputs** (Try it out / navigate to `/inputs`)
2. Fill `#input-text` with `Playwright`
3. Fill `#input-password` with `Secret123`
4. Fill `#input-number` with `42`
5. Fill `#input-date` with `2026-11-03` if editable
6. Click **Display Inputs** (`#btn-display-inputs`)

**Expected Results:**
- Form fields remain visible
- Text input retains value `Playwright` (or displayed output shows the submitted values)
- No navigation to an error page

---

### 2. Login

**Seed:** `tests/seed.spec.ts`

#### 2.1 Valid login

**Steps:**
1. Open `/login`
2. Enter username `practice`
3. Enter password `SuperSecretPassword!`
4. Click Login

**Expected Results:**
- Success flash / body contains secure area or logged-in messaging
- URL indicates authenticated area (`/secure` or equivalent)

#### 2.2 Invalid login

**Steps:**
1. Open `/login`
2. Enter username `wrong`
3. Enter password `wrong`
4. Click Login

**Expected Results:**
- Error / invalid credentials message is shown
- User is not treated as logged in

---

### 3. Dynamic table

**Seed:** `tests/seed.spec.ts`

#### 3.1 Table is visible and has rows

**Steps:**
1. Open `/dynamic-table`
2. Locate the main data table

**Expected Results:**
- Table is visible
- At least one data row is present

---

### 4. JavaScript dialogs

**Seed:** `tests/seed.spec.ts`

#### 4.1 Alert, confirm, and prompt

**Steps:**
1. Open `/js-dialogs`
2. Trigger Alert and accept/dismiss
3. Trigger Confirm
4. Trigger Prompt with text `Agent QA`

**Expected Results:**
- Page remains usable after each dialog
- Result text (if any) updates for prompt/confirm

---

### 5. Unexpected UI overlays

**Seed:** `tests/seed.spec.ts`

#### 5.1 Dismiss cookie / entry ad when present

**Steps:**
1. Open a page that may show cookie consent or entry ad (e.g. `/cookie-alert`, `/entry-ad`)
2. Close or accept the overlay if visible

**Expected Results:**
- Overlay is dismissed or not blocking primary content
- Main page content is interactable

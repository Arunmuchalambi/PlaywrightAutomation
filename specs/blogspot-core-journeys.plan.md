# Automation Practice Blogspot — Core Journeys Test Plan

> Playwright Test Agent 🎭 planner style  
> **Seed:** `tests/seed.spec.ts`  
> **App:** https://testautomationpractice.blogspot.com

## Application Overview

Public practice page with GUI elements: form fields, date pickers, alerts/popups, mouse actions, tables, slider, shadow DOM, and footer links.

---

## Test Scenarios

### 1. Main form fill

**Seed:** `tests/seed.spec.ts`

#### 1.1 Fill name, email, phone and gender

**Steps:**
1. Open home page from seed
2. Fill `#name` with `Agent User`
3. Fill `#email` with `agent@example.com`
4. Fill `#phone` with `9876543210`
5. Select gender male (`#male`)

**Expected Results:**
- Name / email / phone retain values
- Male radio is checked

---

### 2. Date picker

**Seed:** `tests/seed.spec.ts`

#### 2.1 Set Date Picker 1 (mm/dd/yyyy)

**Steps:**
1. Locate `#datepicker`
2. Fill today's date as `mm/dd/yyyy`
3. Press Enter

**Expected Results:**
- Date picker shows the entered date

---

### 3. Alerts

**Seed:** `tests/seed.spec.ts`

#### 3.1 Accept simple alert

**Steps:**
1. Click button that triggers Alert (`Alert` / `#alertBtn` if present)
2. Accept the dialog

**Expected Results:**
- Dialog is handled; page remains usable

---

### 4. Colors multi-select

**Seed:** `tests/seed.spec.ts`

#### 4.1 Select red and yellow

**Steps:**
1. On colors `<select>`, select `red` and `yellow`
2. Assert selected values

**Expected Results:**
- Colors select has values `red` and `yellow`

---

## Generator hints

| Area | Locators |
|------|----------|
| Form | `#name`, `#email`, `#phone`, `#male` |
| Date | `#datepicker` |
| Colors | `#colors` |
| Alert | getByRole('button', { name: /Alert/i }) or `#alertBtn` |

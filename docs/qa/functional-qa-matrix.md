# Functional QA Matrix - Interactive Modules

Last updated: February 17, 2026

This matrix covers every interactive module shipped in Phase 2. Each test case includes expected behavior, edge-case coverage, accessibility requirements, and analytics verification.

---

## 1. TrialStepper (`src/components/islands/TrialStepper.tsx`)

**Route:** `/start-trial`
**Directive:** `client:load`

### 1.1 Step Navigation

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TS-NAV-01 | Load `/start-trial` fresh | Step 1 ("Identity") is visible; progress bar at 33%; Back button is disabled | |
| TS-NAV-02 | Click Continue on Step 1 with valid data | Step 2 ("Exam Context") renders; progress bar at 66% | |
| TS-NAV-03 | Click Continue on Step 2 with valid data | Step 3 ("Consent and Timeline") renders; progress bar at 100% | |
| TS-NAV-04 | Click Back on Step 2 | Step 1 re-renders with previously entered data preserved | |
| TS-NAV-05 | Click Back on Step 3 | Step 2 re-renders with previously entered data preserved | |
| TS-NAV-06 | Back button disabled on Step 1 | `disabled` attribute present; button non-interactive | |
| TS-NAV-07 | Step indicator (`<ol>`) marks current step | `aria-current="step"` on active step `<li>`; prior steps have `active` class | |

### 1.2 Step 1 - Identity Validation

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TS-S1-01 | Submit Step 1 with all fields empty | Error shown for firstName, lastName, email; `aria-invalid="true"` on each; `aria-describedby` links to error span | |
| TS-S1-02 | Submit with first name only | Errors on lastName and email | |
| TS-S1-03 | Enter whitespace-only firstName | Error: "First name is required." | |
| TS-S1-04 | Enter invalid email (`foo`, `a@`, `@b.c`) | Error: "A valid email is required." | |
| TS-S1-05 | Enter valid email (`user@example.com`) | No email error; step advances if other fields valid | |
| TS-S1-06 | Autocomplete attributes present | `given-name` on first, `family-name` on last, `email` on email | |

### 1.3 Step 2 - Exam Context Validation

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TS-S2-01 | Defaults render correctly | examTrack = "LMSW", state = "CA", targetExamWindow = "61-90" | |
| TS-S2-02 | Change exam track to LSW | Select updates; value persists on back/forward navigation | |
| TS-S2-03 | State dropdown contains all US states | All 50 states + DC present with proper codes | |
| TS-S2-04 | Target exam window options | Four options: 0-30, 31-60, 61-90, 90+ | |

### 1.4 Step 3 - Consent and Timeline Validation

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TS-S3-01 | Submit without checking consent | Error: "You need to agree to receive trial resources by email." | |
| TS-S3-02 | Check consent and submit | Form submits; no consent error | |
| TS-S3-03 | Study timeline defaults | "this_month" selected by default | |
| TS-S3-04 | Study timeline options | Three options: immediate, this_month, next_quarter | |

### 1.5 Form Submission

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TS-SUB-01 | Successful submission | Submit button shows "Submitting..."; buttons disabled during fetch; redirect to `/trial/thanks?lead=<id>` | |
| TS-SUB-02 | API returns non-OK response | Global error alert renders: "We couldn't process your request right now. Please try again in a moment."; `role="alert"` and `aria-live="assertive"` present | |
| TS-SUB-03 | Network failure (offline / timeout) | Global error alert renders: "Connection issue detected. Please retry."; submitting state resets | |
| TS-SUB-04 | Rate-limited response (429) | Global error displayed; user not stuck in submitting state | |
| TS-SUB-05 | UTM parameters in URL | `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` captured and sent in payload | |
| TS-SUB-06 | `sourcePage` sent correctly | Payload includes current `pathname + search` | |
| TS-SUB-07 | Double-click prevention | Submit button disabled while `submitting=true`; no duplicate POSTs | |

### 1.6 TrialStepper Analytics

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TS-AN-01 | Page load | `trial_step_view` fires with `step_number: 1, step_name: "Identity"` | |
| TS-AN-02 | Advance to Step 2 | `trial_step_complete` fires (step 1), then `trial_step_view` fires (step 2) | |
| TS-AN-03 | Validation failure on any step | `form_validation_error` fires with `step_number` and comma-separated `fields` | |
| TS-AN-04 | Successful submission | `trial_step_complete` (step 3), `trial_submit`, then `trial_submit_success` with `lead_id` | |
| TS-AN-05 | Failed submission | `trial_submit_error` fires with `error_code` matching API response | |
| TS-AN-06 | Network error on submit | `trial_submit_error` fires with `error_code: "NETWORK"` | |

---

## 2. Trial Lead API (`src/pages/api/trial-lead.ts`)

**Route:** `POST /api/trial-lead`

### 2.1 Validation

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| API-V-01 | Valid payload with all fields | 200 response; `{ success: true, leadId: "..." }` | |
| API-V-02 | Missing `firstName` | 400; `errorCode: "VALIDATION_ERROR"` | |
| API-V-03 | Invalid email format | 400; `errorCode: "VALIDATION_ERROR"` | |
| API-V-04 | Invalid `examTrack` value (e.g. "MSW") | 400; `errorCode: "VALIDATION_ERROR"` | |
| API-V-05 | State code not 2 uppercase letters | 400; `errorCode: "VALIDATION_ERROR"` | |
| API-V-06 | `consentToEmail: false` | 400; `errorCode: "VALIDATION_ERROR"` (Zod `z.literal(true)`) | |
| API-V-07 | Non-JSON body | 400; `errorCode: "VALIDATION_ERROR"` | |
| API-V-08 | Empty body | 400; `errorCode: "VALIDATION_ERROR"` | |

### 2.2 Rate Limiting

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| API-RL-01 | 10 valid requests in 60s from same IP | All succeed | |
| API-RL-02 | 11th request in same window | 429; `errorCode: "RATE_LIMITED"` | |
| API-RL-03 | Request after window resets (>60s) | Succeeds normally | |

### 2.3 HubSpot Integration

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| API-HS-01 | No `HUBSPOT_PRIVATE_APP_TOKEN` set | Synthetic lead ID returned (`local-<timestamp>`); no external call | |
| API-HS-02 | Valid token, HubSpot accepts | `leadId: "hubspot-<id>"`; contact upserted by email | |
| API-HS-03 | HubSpot returns non-OK | 502; `errorCode: "HUBSPOT_ERROR"`; error logged server-side | |
| API-HS-04 | Field mapping accuracy | `firstname`, `lastname`, `email`, `state`, `jobtitle`, `website` mapped correctly | |
| API-HS-05 | Upsert behavior (existing email) | Existing contact updated, not duplicated | |

### 2.4 Response Headers

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| API-H-01 | Any response | `Content-Type: application/json`; `Cache-Control: no-store` | |

---

## 3. FAQAccordion (`src/components/islands/FAQAccordion.tsx`)

**Routes:** `/` (home), other pages with FAQ sections
**Directive:** `client:load`

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| FAQ-01 | Initial load | First FAQ item is expanded (index 0); all others collapsed | |
| FAQ-02 | Click collapsed item | Item expands; previously open item collapses (single-open behavior) | |
| FAQ-03 | Click currently open item | Item collapses; no item is open | |
| FAQ-04 | Keyboard: Tab to button, press Enter | Toggles expansion; focus stays on button | |
| FAQ-05 | Keyboard: Tab to button, press Space | Toggles expansion; focus stays on button | |
| FAQ-06 | `aria-expanded` attribute | `true` on open item button; `false` on all closed | |
| FAQ-07 | `aria-controls` links to panel | Button `aria-controls` matches panel `id` | |
| FAQ-08 | Panel `role="region"` with `aria-labelledby` | Panel `aria-labelledby` matches button `id` | |
| FAQ-09 | `hidden` attribute on collapsed panels | `hidden` present on collapsed panels; absent on expanded | |
| FAQ-10 | Visual toggle indicator | `+` shown for collapsed; `-` shown for expanded; marked `aria-hidden="true"` | |
| FAQ-11 | Empty items array | No items render; no JS errors | |

---

## 4. TestimonialsCarousel (`src/components/islands/TestimonialsCarousel.tsx`)

**Route:** `/` (home)
**Directive:** `client:load`

### 4.1 Core Behavior

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC-01 | Initial render with testimonials | First featured testimonial visible; dots rendered matching card count | |
| TC-02 | Auto-rotation (normal motion) | Slides advance every 7 seconds | |
| TC-03 | Auto-rotation (prefers-reduced-motion) | Auto-rotation does not start; manual nav still works | |
| TC-04 | Single testimonial | Carousel renders single card; no auto-rotation started | |
| TC-05 | Empty testimonials array | Component returns `null`; no DOM output | |
| TC-06 | No featured testimonials | Falls back to first 5 from full array | |

### 4.2 Manual Navigation

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC-NAV-01 | Click Next button | Advances to next slide | |
| TC-NAV-02 | Click Next on last slide | Wraps to first slide | |
| TC-NAV-03 | Click Previous button | Goes to prior slide | |
| TC-NAV-04 | Click Previous on first slide | Wraps to last slide | |
| TC-NAV-05 | Click dot indicator | Jumps to corresponding slide | |
| TC-NAV-06 | Active dot styling | Active dot has `active` class; `aria-selected="true"` | |

### 4.3 Accessibility

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TC-A11Y-01 | Section label | `aria-label="Featured student outcomes"` on section | |
| TC-A11Y-02 | Button labels | Previous: `aria-label="Previous testimonial"`; Next: `aria-label="Next testimonial"` | |
| TC-A11Y-03 | Dot labels | Each dot: `aria-label="Show testimonial N"` | |
| TC-A11Y-04 | Dots tablist | Container has `role="tablist"`; dots have `role="tab"` | |
| TC-A11Y-05 | Quote mark decorative | Quote mark `"` has `aria-hidden="true"` | |
| TC-A11Y-06 | Keyboard: Tab through controls | Focus moves through prev, dots, next buttons in order | |

---

## 5. TestimonialsFilter (`src/components/islands/TestimonialsFilter.tsx`)

**Route:** `/success-stories`
**Directive:** `client:load`

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TF-01 | Initial load | All testimonials displayed; exam track = "All tracks"; state = "All states" | |
| TF-02 | Filter by exam track (LSW) | Only LSW stories shown; result count updates | |
| TF-03 | Filter by state (NY) | Only stories from NY shown; result count updates | |
| TF-04 | Combine exam track + state | Intersection filter applied; count reflects combined result | |
| TF-05 | Reset filter to "All tracks" | Full list restores | |
| TF-06 | No matching results | Empty state card: "No stories match your current filters. Try a different state or exam track." | |
| TF-07 | Result count live region | `aria-live="polite"` on result count paragraph; screen reader announces count changes | |
| TF-08 | Form does not submit on Enter | `onSubmit` calls `preventDefault()`; no page reload | |
| TF-09 | Filter form label | `aria-label="Filter student stories"` on form | |
| TF-10 | Card variant alternation | Even-index cards: `data-format-variant="quote-focus"`; odd: `"result-focus"` | |
| TF-11 | State name display | Cards show full state name (via `stateCodeToName`), not code | |

### TestimonialsFilter Analytics

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| TF-AN-01 | Change exam track filter | `filter_interaction` fires: `filter_type: "exam_track"`, `module: "success-stories-filter"` | |
| TF-AN-02 | Change state filter | `filter_interaction` fires: `filter_type: "state"`, `module: "success-stories-filter"` | |

---

## 6. CeCatalogFilter (`src/components/islands/CeCatalogFilter.tsx`)

**Route:** `/continuing-education`
**Directive:** `client:load`

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| CE-01 | Initial load | All courses displayed; all filters set to "all" | |
| CE-02 | Filter by category (Ethics) | Only Ethics courses shown; count updates | |
| CE-03 | Filter by format (live) | Only live courses shown | |
| CE-04 | Filter by audience (LCSW) | LCSW-specific + "all" audience courses shown | |
| CE-05 | Combine all three filters | Intersection of category + format + audience | |
| CE-06 | Reset to all | Full catalog restores | |
| CE-07 | No matching courses | Grid is empty (no courses rendered) | |
| CE-08 | Result count live region | `aria-live="polite"` on count; screen reader announces updates | |
| CE-09 | Filter form label | `aria-label="Filter CE catalog"` on form | |
| CE-10 | Course card content | Displays: category, CE hours, format, title, audience context | |
| CE-11 | Course CTA link | Links to `/start-trial`; `data-cta="ce-course-cta"` with `data-cta-location` set to course ID | |
| CE-12 | Form does not submit on Enter | `onSubmit` calls `preventDefault()`; no page reload | |

### CeCatalogFilter Analytics

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| CE-AN-01 | Change category filter | `filter_interaction` fires: `filter_type: "category"`, `module: "ce-catalog"` | |
| CE-AN-02 | Change format filter | `filter_interaction` fires: `filter_type: "format"`, `module: "ce-catalog"` | |
| CE-AN-03 | Change audience filter | `filter_interaction` fires: `filter_type: "audience"`, `module: "ce-catalog"` | |

---

## 7. Header / Mobile Navigation (`src/components/Header.astro`)

**Route:** All pages
**Script:** `is:inline` vanilla JS

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| NAV-01 | Desktop: nav links visible | All nav items rendered in `#primary-nav` | |
| NAV-02 | Mobile: menu toggle visible | Hamburger button visible; nav collapsed by default | |
| NAV-03 | Mobile: tap hamburger | `aria-expanded` toggles to `"true"`; nav gets `is-open` class | |
| NAV-04 | Mobile: tap hamburger again | `aria-expanded` toggles to `"false"`; `is-open` removed | |
| NAV-05 | Mobile: click a nav link | Menu closes; `aria-expanded` set to `"false"`; `is-open` removed | |
| NAV-06 | Hamburger `aria-controls` | Points to `"primary-nav"` | |
| NAV-07 | Screen reader label | `<span class="sr-only">Toggle navigation</span>` present | |
| NAV-08 | Brand link | Links to `/`; `aria-label` includes site name + "home" | |
| NAV-09 | Primary CTA link | Primary nav item has `primary-link` class and `data-cta="header-primary"` | |
| NAV-10 | Nav `aria-label` | `aria-label="Primary"` on `<nav>` | |
| NAV-11 | No `href="#"` links | All nav links point to real routes | |

---

## 8. Cross-Module Functional Checks

| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| CROSS-01 | No `href="#"` links anywhere in production | Audit all rendered pages: zero placeholder links | |
| CROSS-02 | All `data-cta` attributes have non-empty values | No empty or missing CTA tracking attributes on interactive CTAs | |
| CROSS-03 | All interactive islands hydrate | Each `client:load` island renders without JS errors in console | |
| CROSS-04 | Browser back/forward through trial steps | Browser history does not break stepper (stepper is state-based, not URL-based) | |
| CROSS-05 | Page refresh preserves nothing (no localStorage) | Refreshing `/start-trial` resets form to Step 1 | |
| CROSS-06 | All filter forms prevent default submit | No page reloads on Enter in filter dropdowns | |
| CROSS-07 | All error messages use `role="alert"` or `aria-live` | Validation and submission errors announced to screen readers | |
| CROSS-08 | No console errors on any route | Clean console on: `/`, `/exam-prep`, `/success-stories`, `/start-trial`, `/continuing-education`, `/about`, `/contact`, `/resources`, `/state-requirements/*` | |

---

## Test Execution Notes

**Browsers:** Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
**Devices:** Desktop (1440px), Tablet (768px), Mobile (375px)
**Assistive Tech:** NVDA (Windows), VoiceOver (macOS/iOS)

**Pass criteria:** A test passes when the expected result is fully met across all target browsers at all breakpoints (unless test is breakpoint-specific).

**Severity guidance:**
- P1 (Blocker): Submission fails, data loss, accessibility barrier, broken navigation
- P2 (Critical): Wrong analytics payload, visual state mismatch, degraded UX
- P3 (Minor): Cosmetic inconsistency, non-blocking edge case

# Agents of Change - Product Roadmap (Elemental-First, Design-Complete)

Last updated: February 17, 2026
Primary audience: first-time social work exam takers
Primary KPI: free trial conversion rate (`/start-trial`)
Release gate: WCAG 2.2 AA required before launch

This roadmap is intentionally ordered to complete elemental site changes first:
1. Graphic design enhancement
2. Feature experience upgrades
3. Page expansion and narrative architecture
4. Platform hardening, integration, and launch ops

## Phase 1 - Elemental Design Additions Program (Priority Program, Weeks 1-4)

### 1.1 Workstream Delivery Matrix

| Workstream | Scope Additions | Deliverables | Estimate | Dependencies | Status |
|---|---|---|---|---|---|
| 1. Brand System Expansion | Semantic color scales, typography ladder (display/body/ui/meta), iconography rules, elevation and texture language, image treatment direction | Brand spec v2, token map, visual reference board, do/don't guide | 3-4 design days | Existing token baseline | In Progress |
| 2. Layout and Composition System | Multi-breakpoint grid rules, section rhythm templates, spacing cadence by page type, asymmetrical layout patterns, conversion-first module ordering | Layout primitives spec, page scaffolding kit, breakpoint matrix | 3-5 design days | Workstream 1 | In Progress |
| 3. Motion and Interaction Language | Motion tiers (micro/section/hero), scroll choreography patterns, hover/focus/press feedback, reduced-motion equivalents | Motion system spec, transition library, reduced-motion matrix | 4-6 design days | Workstreams 1-2 | In Progress |
| 4. Component Design Library v2 | Expanded component variants: hero, trust modules, pricing comparison, testimonial systems, quiz/interactive modules, form stepper states, nav/footer variants, cards/tables/tabs/accordions/banners/toasts | Component inventory, full state matrix, usage guidance, accessibility notes per component | 5-7 design days | Workstreams 1-3 | In Progress |
| 5. Conversion-Critical Page Design Pass | Deep redesign for `/`, `/exam-prep`, `/start-trial`, `/success-stories` with richer narrative proof and CTA hierarchy | Hi-fi comps, interaction notes, copy structure, module map | 6-8 design days | Workstreams 2-4 | In Progress |
| 6. Secondary Page Expansion Design | Full IA and design for `/about`, `/contact`, `/continuing-education`, `/resources`; template refinement for `/state-requirements/[state]` | Page blueprints, final comps, module compatibility map | 5-7 design days | Workstreams 2-4 | In Progress |
| 7. Content Design and Messaging Architecture | Narrative hierarchy rewrite, section intent mapping, proof and CTA consistency rules, long-form vs short-form patterns | Content design brief, page-level copy matrix, CTA taxonomy | 4-6 design days | Workstreams 1, 5 | In Progress |
| 8. Art Direction and Asset Plan | Reuse existing media at launch, define net-new asset backlog, social/OG frame direction, illustration brief | Asset backlog, production briefs, acceptance criteria per asset | 3-4 design days | Workstreams 1, 5 | In Progress |
| 9. Design QA and Readiness Gates | Cross-breakpoint visual QA, interaction QA, accessibility QA, performance-aware motion QA | QA checklist, defect rubric, sign-off report | 3-5 design days | Workstreams 3-8 | Planned |

### 1.2 Decision-Complete Page Additions (Elemental Page Scope)

1. `/` Home:
- Editorial hero variants
- Proof-density strip and trust badges
- Segmented audience pathways
- Rich comparison module
- Objection-handling block
- Multi-CTA hierarchy anchored on `Start Free Trial`

2. `/exam-prep`:
- Curriculum architecture visualization
- Study journey timeline
- Competency outcome cards
- Outcomes grid and plan selector enhancements

3. `/start-trial`:
- Confidence-building side panel variants
- Progress reinforcement states
- Inline trust cues
- Stronger validation and error-recovery UX
- Completion reassurance patterns

4. `/success-stories`:
- Narrative card format variants
- Advanced filtering states
- Quote-to-proof pairings
- Before/after confidence storytelling modules

5. `/state-requirements/[state]`:
- Standardized requirement blocks
- Local trust callouts
- Cross-links to exam prep, trial, CE
- Scannable compliance formatting

6. `/about` (new):
- Instructor credibility narrative
- Teaching methodology timeline
- Framework visualization blocks

7. `/contact` (new):
- Support pathways by intent
- SLA messaging blocks
- Quick-route conversion cards

8. `/continuing-education` (new):
- Catalog framing
- Filtered course discovery
- CE outcome framing and conversion bridges

9. `/resources` (new):
- Article hub architecture
- Featured learning tracks
- Bridge CTAs into trial funnel

### 1.3 Required Design Artifact Set (Mandatory Before Full Handoff)

1. Token spec: color, typography, spacing, elevation, radius, motion
2. Component spec pack: variants, states, accessibility behavior, responsive behavior
3. Page wireframes: low-fi narrative structure for all priority routes
4. Hi-fi comps: desktop, tablet, mobile for all launch-priority pages
5. Interaction spec: timing, triggers, easing, reduced-motion fallbacks
6. Content design matrix: headline, subhead, CTA patterns by module
7. QA rubric: visual, interaction, accessibility, performance, regression checks

Status references:
- `docs/design/token-spec.md`
- `docs/design/component-spec-pack.md`
- `docs/design/page-wireframes.md`
- `docs/design/hifi-spec.md`
- `docs/design/interaction-spec.md`
- `docs/design/content-matrix.md`
- `docs/design/qa-rubric.md`

### 1.4 Elemental Acceptance Gates

- No page-level hi-fi approval before component + motion contracts are finalized.
- No motion-heavy sign-off without reduced-motion equivalent and perf review.
- No interactive component accepted without full state coverage:
  `default`, `hover`, `focus`, `active`, `disabled`, `error`.

## Phase 2 - Feature and Page Implementation (Weeks 5-6)

### 2.1 Conversion-Critical Feature Delivery

- [x] Multi-step trial funnel (`/start-trial`) implemented
- [x] Trial step validation and progression implemented
- [x] Trial success route (`/trial/thanks`) with next-step CTA implemented
- [x] Story filtering and testimonial interaction patterns implemented
- [x] FAQ interaction and CTA instrumentation implemented
- [x] Complete functional QA matrix for all interactive modules
- [ ] Outage-safe UX verification for external dependencies (HubSpot/API paths)

### 2.2 Route Surface and IA Delivery

- [x] `/`
- [x] `/exam-prep`
- [x] `/success-stories`
- [x] `/state-requirements`
- [x] `/state-requirements/[state]`
- [x] `/start-trial`
- [x] `/trial/thanks`
- [x] `/privacy`
- [x] `/terms`
- [x] `/about`
- [x] `/contact`
- [x] `/continuing-education`
- [x] `/resources`

### 2.3 Frontend Design Contract Implementation

Implemented shared contracts:
```ts
type MotionTier = "none" | "micro" | "section" | "hero";
type ThemeIntent = "default" | "editorial" | "conversion" | "trust";

interface SectionDesignConfig {
  themeIntent: ThemeIntent;
  motionTier: MotionTier;
  density: "compact" | "regular" | "expanded";
  visualVariant: string;
}

interface ComponentVariantContract {
  componentId: string;
  variant: string;
  states: Array<"default" | "hover" | "focus" | "active" | "disabled" | "error">;
  accessibilityNotes: string[];
}
```

## Phase 3 - Platform Integrations and Content Ops (Weeks 6-7)

### 3.1 CMS (Sanity) Extensions

- [x] Added schema extension targets:
  - `pageModule`
  - `designVariant`
  - `assetBrief`
  - `ctaPattern`
- [ ] Connect production Sanity project + dataset
- [ ] Seed production documents for new schema targets
- [ ] Configure publish webhook for Vercel deploy

### 3.2 Lead Routing (HubSpot)

- [x] `POST /api/trial-lead` flow implemented
- [ ] Set production `HUBSPOT_PRIVATE_APP_TOKEN`
- [ ] Validate field mappings, upsert behavior, and outage fallback UX

### 3.3 Analytics Extensions

- [x] Existing conversion events implemented:
  - `cta_click`
  - `trial_step_view`
  - `trial_step_complete`
  - `trial_submit`
  - `trial_submit_success`
  - `trial_submit_error`
- [x] Design interaction events implemented:
  - `module_view`
  - `section_engagement`
  - `filter_interaction`
  - `form_validation_error`
- [ ] GA4 validation in production (single-fire checks and payload QA)
- [ ] Dashboard setup for trial conversion by landing page/state

## Phase 4 - Accessibility, Performance, and SEO Hardening (Weeks 7-8)

### 4.1 Accessibility (WCAG 2.2 AA Release Gate)

- [x] Skip link and keyboard baseline
- [x] Focus-visible styling and ARIA-expanded patterns
- [x] Reduced-motion baseline
- [ ] Full keyboard-only test matrix: nav, filters, forms, carousel, accordion
- [ ] Screen-reader QA (NVDA and VoiceOver)
- [ ] Contrast audit and remediations across all variants
- [ ] Form error announcements validated end-to-end

### 4.2 Performance Budgets

- [ ] LCP < 2.5s (mobile p75)
- [ ] INP < 200ms (mobile p75)
- [ ] CLS < 0.1
- [ ] Home route JS budget < 120KB gzip (route-owned scripts)
- [ ] Motion-density perf validation under production conditions

### 4.3 SEO and Discoverability

- [x] Canonical URLs
- [x] Open Graph and Twitter metadata
- [x] Sitemap and robots
- [x] JSON-LD on key routes
- [ ] Validate schema in Rich Results Test
- [ ] Verify all public routes indexed in sitemap, including state pages
- [ ] Expand internal linking between state, resources, exam prep, and trial routes

## QA Test Matrix (Required)

Functional:
1. No empty or placeholder links in production (no `href="#"`)
2. Trial form validation per field and step
3. HubSpot submission creates/updates contact with expected properties
4. Graceful retry/fallback UX during HubSpot/API outage

Accessibility:
1. Keyboard-only operability for nav, filters, forms, carousels, accordions
2. Correct labels, roles, and ARIA-expanded behavior
3. Reduced-motion alternatives preserve information hierarchy
4. Contrast passes WCAG 2.2 AA for text and UI components

Design/UX:
1. Visual consistency against tokenized system at desktop/tablet/mobile
2. Component state coverage documented and implemented
3. Responsive narrative integrity across breakpoints
4. Cross-route cohesion for visual and interaction language

Performance:
1. Lighthouse mobile thresholds aligned to budgets
2. No layout shift from images/fonts
3. High-motion modules remain within performance budget

Analytics:
1. Event payloads fire once per action
2. `sourcePage` and UTM metadata propagate to trial submission

## Technical Defaults and Constraints

Architecture:
- Astro + TypeScript strict mode
- React islands for interactive modules
- Sanity CMS for content operations
- HubSpot for lead routing
- Vercel hosting adapter

Config note:
- Deprecated `output: "hybrid"` is removed.
- Use default/static behavior in Astro config (current configuration compliant).

Implementation constraints:
- Reuse existing media at launch
- Copy refresh only (no full brand rewrite)
- High-motion direction is allowed only with accessibility/performance guardrails

## Launch Readiness Definition

Launch is approved only when all are true:
1. WCAG 2.2 AA checks pass across priority routes
2. Trial funnel conversion flow and HubSpot mapping are verified in production
3. Analytics events are validated and dashboard baselines are live
4. Design QA rubric is complete with no open P1/P2 defects

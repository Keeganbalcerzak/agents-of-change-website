# Component Spec Pack

## Global Rules
- Every interactive component must support: default, hover, focus, active, disabled, error (where relevant).
- Every component with motion must define reduced-motion fallback.
- Every component must expose clear hierarchy: label, title, body, action.

## Core Components

### Header/Nav
- Variants: desktop expanded, mobile collapsible.
- Accessibility: menu toggle with `aria-expanded`, semantic nav region.

### CTA Buttons
- Variants: primary, secondary, ghost.
- States: focus-visible ring required.

### Trust Marquee
- Use duplicated track for seamless motion loop.
- Reduced motion: stop animation and keep readable chips.

### Audience Pathway Cards
- Variants by pathway id (`first-time`, `repeat`, `ce-focus`).
- CTA per card with tracked location.

### Comparison Table
- Semantic `<table>` with row/column headers.
- Mobile fallback must remain readable (stack or horizontal scroll).

### Testimonial System
- Carousel for featured narratives.
- Filter grid with format variants and empty state.

### Trial Stepper
- 3-step progression with inline validation.
- Error states emit analytics + visible field messaging.

### Support Pathway Cards
- Includes response SLA line and direct action.

### CE Catalog Filter
- Filters: category, format, audience.
- Emits filter interaction event per control change.

### Resource Cards
- Metadata + excerpt + action pattern.

## New Route Components
- About: methodology framework cards + timeline.
- Contact: support pathways + SLA cards.
- Continuing Education: filterable course catalog.
- Resources: featured tracks + article cards.

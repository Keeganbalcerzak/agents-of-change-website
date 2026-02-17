# Design QA Rubric

## Visual QA
- Tokens applied consistently (color, spacing, typography, radius, elevation).
- No unresolved breakpoint layout collisions.
- Hierarchy and CTA prominence consistent with section intent.

## Interaction QA
- All interactive components show expected state transitions.
- Motion tiers applied by section and visible in behavior.
- Filter and form interactions emit expected analytics events.

## Accessibility QA
- Keyboard navigation complete for nav, forms, filters, accordions, carousels.
- Focus-visible styles clear and consistent.
- Contrast meets WCAG 2.2 AA targets.
- Reduced-motion behavior verified.

## Performance-Aware Motion QA
- Motion does not introduce major layout shifts.
- No heavy runtime animation loops outside controlled modules.
- Build output reviewed against client JS and perf budgets.

## Regression QA
- Re-run check/build after each rollout wave.
- Route smoke test for all primary and newly added pages.

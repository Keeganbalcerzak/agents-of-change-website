# Interaction and Motion Spec

## Motion Tier Rules
- `none`: no animation except essential feedback.
- `micro`: hover/focus/press transitions under 200ms.
- `section`: reveal transitions tied to viewport entry.
- `hero`: richer choreography for first-view impact.

## Triggers
- Intersection-based reveal for `[data-module]` and `.reveal` items.
- CTA click tracking from delegated document listener.
- Filter interaction tracking from island components.

## Analytics Mapping
- `module_view`: first visible state for module
- `section_engagement`: deep visibility threshold reached
- `filter_interaction`: user changes filter controls
- `form_validation_error`: validation errors surfaced in trial stepper

## Reduced Motion
- Disable continuous animations and stagger effects via `prefers-reduced-motion`.
- Keep information hierarchy readable with static states.

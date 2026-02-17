# Token Spec v2

## Color Tokens
- Base background: `--bg`
- Surface layers: `--surface`, `--surface-alt`
- Ink scale: `--ink`, `--ink-soft`, `--ink-muted`
- Brand primaries: `--primary`, `--primary-soft`
- Accent scale: `--gold`, `--gold-soft`
- Border: `--border`

## Typography Tokens
- Display family: `--font-display`
- Body/UI family: `--font-body`
- Heading scale: `h1`, `h2`, `h3` with clamp values
- Body copy: paragraph defaults in `body` and component scopes

## Spacing Tokens
- Vertical rhythm scale: `--space-1` through `--space-8`
- Container width token: `--container`

## Elevation and Radius Tokens
- Radius scale: `--radius-sm`, `--radius-md`, `--radius-lg`
- Shadow scale: `--shadow-sm`, `--shadow-md`

## Motion Tokens
- Motion tiers: `none`, `micro`, `section`, `hero`
- Transition usage:
  - micro: short hover/focus interactions
  - section: reveal and card entrance choreography
  - hero: high-emphasis opening sequences

## Semantic Theme Intents
- `default`: general content sections
- `editorial`: storytelling blocks and content-rich modules
- `conversion`: CTA and decision-oriented sections
- `trust`: social proof, compliance, and support sections

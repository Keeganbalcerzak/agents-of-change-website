# Agents of Change Premium Conversion Platform

Astro + React islands + Sanity CMS + HubSpot lead routing, designed for first-time social work test takers.

## Stack

- Astro (static output mode) + TypeScript strict mode
- React islands for interactive components
- Sanity for content management
- HubSpot contact API for trial lead capture
- Vercel deployment target

## Runtime

- Node.js 22 recommended (`.nvmrc` included)

## Routes

- `/` Home
- `/exam-prep`
- `/success-stories`
- `/state-requirements/[state]`
- `/start-trial`
- `/trial/thanks`
- `/privacy`
- `/terms`
- `POST /api/trial-lead`

## Environment Variables

Copy `.env.example` to `.env` and set values.

- `PUBLIC_SITE_URL`
- `PUBLIC_GA_MEASUREMENT_ID`
- `PUBLIC_SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_READ_TOKEN`
- `HUBSPOT_PRIVATE_APP_TOKEN`

## Commands

- `npm run dev`
- `npm run check`
- `npm run build`
- `npm run sanity` (for Sanity CLI operations)

## HubSpot Notes

`POST /api/trial-lead` creates/updates a contact in HubSpot when `HUBSPOT_PRIVATE_APP_TOKEN` is configured.
In local dev without token, the endpoint returns a synthetic success response so the funnel can be tested.

## Sanity Notes

Sanity schemas are in `sanity/schemaTypes`.
You can wire your existing Sanity Studio repo to these schema definitions or run studio from this repo:

- `npx sanity@latest init --create-project \"Agents of Change\"` (if needed)
- `npm run sanity dev`

## Vercel + Publish Webhook

1. In Vercel, create a Deploy Hook for this project.
2. Add the hook URL to your Sanity project webhook (trigger on publish for relevant document types).
3. Set webhook filter to content types used here: `siteSettings`, `navItem`, `programOffer`, `testimonial`, `faqItem`, `instructorProfile`, `stateRequirement`, `seoMetadata`.

## Quality Gates

- WCAG 2.2 AA patterns for keyboard/focus/ARIA/reduced motion
- SEO metadata + JSON-LD + sitemap + robots
- CI check preventing `href="#"` placeholders

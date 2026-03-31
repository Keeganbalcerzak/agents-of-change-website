# Community Platform — Plan 1: Database & Auth Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up Supabase as the community database and auth backend, implement Thinkific OAuth so students sign in with their existing credentials, and surface an auth-aware Sign In button and user menu in the site header.

**Architecture:** Supabase manages user identity and Postgres. A student clicks "Sign In" → redirected to Thinkific OAuth → callback route exchanges the authorization code for a Thinkific access token → fetches the student's profile from the Thinkific API → creates or updates the Supabase user via the Admin API → generates a magic-link token server-side and immediately exchanges it for a session cookie. React islands read the session client-side via `@supabase/ssr`'s browser client.

**Tech Stack:** `@supabase/supabase-js` v2, `@supabase/ssr`, Vitest (unit tests), Thinkific OAuth 2.0, Astro 5 server-side API routes (Vercel adapter), React 19 islands, TypeScript

> **Note on Thinkific endpoints:** Verify these against Thinkific's official API docs before running: authorization `https://api.thinkific.com/oauth/authorize`, token exchange `https://api.thinkific.com/oauth/token`, user profile `GET /api/v1/users/current`. Endpoint availability depends on your Thinkific plan tier.

---

## File Map

### New Files

- `supabase/migrations/001_initial_schema.sql` — full DB schema (all community tables)
- `supabase/migrations/002_seed_channels.sql` — pre-seeded chat channels
- `supabase/migrations/003_rls_policies.sql` — row-level security policies for all tables
- `vitest.config.ts` — Vitest configuration
- `src/lib/supabase.ts` — Supabase client factory (browser + server + admin)
- `src/lib/auth-utils.ts` — pure utility functions for OAuth and user parsing (unit-testable)
- `src/lib/community-types.ts` — TypeScript types for all community data models
- `src/pages/api/auth/thinkific.ts` — initiates Thinkific OAuth redirect with CSRF state
- `src/pages/api/auth/callback.ts` — handles OAuth callback, creates Supabase session
- `src/pages/api/auth/signout.ts` — clears session cookies
- `src/components/islands/AuthButton.tsx` — Sign In / Sign Out toggle button
- `src/components/islands/UserMenu.tsx` — avatar + dropdown when signed in
- `src/components/islands/ProfileSetupModal.tsx` — prompts for exam track, state, study stage
- `src/__tests__/auth-utils.test.ts` — unit tests for auth utility functions

### Modified Files

- `package.json` — add `@supabase/supabase-js`, `@supabase/ssr`, `vitest`, `@vitest/ui`
- `.env.example` — document Supabase and Thinkific env vars
- `src/lib/types.ts` — add `CommunityUser` export
- `src/components/Header.astro` — add `AuthButton` island inside `<nav>`

---

### Task 1: Install Dependencies & Set Up Test Framework

**Files:**

- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install Supabase and Vitest packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D vitest @vitest/ui
```

Expected: packages appear in `node_modules/`. No peer dependency errors.

- [ ] **Step 2: Create Vitest config**

Create `vitest.config.ts` at project root:

```typescript
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Add test script to package.json**

In `package.json`, inside `"scripts"`, add after the `"check:bundle-size"` line:

```json
"test": "vitest run",
"test:ui": "vitest --ui"
```

- [ ] **Step 4: Verify Vitest runs**

```bash
npx vitest run
```

Expected: `No test files found` (no tests written yet — that's fine). Exit code 0.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add @supabase/ssr, @supabase/supabase-js, vitest"
```

---

### Task 2: Document Environment Variables

**Files:**

- Modify: `.env.example`

- [ ] **Step 1: Read existing .env.example**

Open `.env.example` and read its current contents so you know what's already documented.

- [ ] **Step 2: Append new env vars to .env.example**

Add the following block at the end of `.env.example`:

```bash
# ── Supabase ────────────────────────────────────────────────────────────────
# Find these in your Supabase project → Settings → API
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Service role key — SERVER SIDE ONLY. Never expose to the browser.
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ── Thinkific OAuth ──────────────────────────────────────────────────────────
# Register an OAuth app in your Thinkific admin → API → OAuth Applications
# Redirect URI to register: https://www.agentsofchangeprep.com/api/auth/callback
THINKIFIC_CLIENT_ID=your-thinkific-oauth-client-id
THINKIFIC_CLIENT_SECRET=your-thinkific-oauth-client-secret
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs: document Supabase and Thinkific env vars"
```

---

### Task 3: Database Schema Migration

**Files:**

- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create the schema file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- ── Profiles ────────────────────────────────────────────────────────────────
-- One row per authenticated user. Created on first sign-in via Thinkific OAuth.
create table public.profiles (
  id              uuid primary key references auth.users on delete cascade,
  thinkific_id    text unique not null,
  display_name    text not null,
  avatar_url      text,
  exam_track      text check (exam_track in ('BSW', 'LMSW', 'LCSW')),
  state           text,
  study_stage     text check (study_stage in (
    'just_started', 'actively_studying', 'exam_scheduled', 'passed'
  )),
  seeking_partner boolean not null default false,
  is_staff        boolean not null default false,
  last_active_at  timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- ── Chat Channels ────────────────────────────────────────────────────────────
create table public.channels (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  label       text not null,
  type        text not null check (type in ('exam', 'state', 'general', 'session')),
  exam_track  text,
  state       text,
  created_at  timestamptz not null default now()
);

-- ── Messages ─────────────────────────────────────────────────────────────────
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  channel_id  uuid not null references public.channels on delete cascade,
  author_id   uuid not null references public.profiles on delete cascade,
  body        text not null,
  pinned      boolean not null default false,
  created_at  timestamptz not null default now()
);

create index messages_channel_created on public.messages (channel_id, created_at desc);

-- ── Reactions ────────────────────────────────────────────────────────────────
create table public.reactions (
  message_id  uuid not null references public.messages on delete cascade,
  author_id   uuid not null references public.profiles on delete cascade,
  emoji       text not null check (emoji in ('👍', '🧠', '🎉', '❤️')),
  primary key (message_id, author_id, emoji)
);

-- ── Study Sessions ───────────────────────────────────────────────────────────
create table public.study_sessions (
  id          uuid primary key default gen_random_uuid(),
  host_id     uuid not null references public.profiles on delete cascade,
  title       text not null,
  exam_track  text,
  starts_at   timestamptz not null,
  ended_at    timestamptz,
  channel_id  uuid references public.channels on delete set null
);

create index study_sessions_active on public.study_sessions (starts_at)
  where ended_at is null;

-- ── Connection Requests (Peer Matching) ─────────────────────────────────────
create table public.connection_requests (
  id           uuid primary key default gen_random_uuid(),
  from_id      uuid not null references public.profiles on delete cascade,
  to_id        uuid not null references public.profiles on delete cascade,
  status       text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'expired')),
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  unique (from_id, to_id)
);

-- ── DM Threads ───────────────────────────────────────────────────────────────
-- participant_a is always the lower UUID to prevent (A,B)/(B,A) duplicates.
create table public.dm_threads (
  id            uuid primary key default gen_random_uuid(),
  participant_a uuid not null references public.profiles on delete cascade,
  participant_b uuid not null references public.profiles on delete cascade,
  created_at    timestamptz not null default now(),
  check (participant_a < participant_b),
  unique (participant_a, participant_b)
);

create table public.dm_messages (
  id         uuid primary key default gen_random_uuid(),
  thread_id  uuid not null references public.dm_threads on delete cascade,
  author_id  uuid not null references public.profiles on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

create index dm_messages_thread on public.dm_messages (thread_id, created_at asc);

-- ── Forum Categories ─────────────────────────────────────────────────────────
create table public.forum_categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  label      text not null,
  sort_order int not null
);

-- ── Forum Threads ────────────────────────────────────────────────────────────
create table public.forum_threads (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles on delete cascade,
  category_id uuid not null references public.forum_categories on delete restrict,
  title       text not null,
  body        text not null,
  exam_track  text,
  state       text,
  pinned      boolean not null default false,
  locked      boolean not null default false,
  created_at  timestamptz not null default now()
);

create index forum_threads_category on public.forum_threads (category_id, created_at desc);
create index forum_threads_state on public.forum_threads (state) where state is not null;

-- ── Forum Replies ────────────────────────────────────────────────────────────
create table public.forum_replies (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references public.forum_threads on delete cascade,
  parent_id   uuid references public.forum_replies on delete cascade,
  author_id   uuid not null references public.profiles on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index forum_replies_thread on public.forum_replies (thread_id, created_at asc);

-- ── Forum Reply Helpful Marks ────────────────────────────────────────────────
-- Separate table prevents duplicate helpful marks per user per reply.
create table public.forum_reply_helpful_marks (
  reply_id  uuid not null references public.forum_replies on delete cascade,
  user_id   uuid not null references public.profiles on delete cascade,
  primary key (reply_id, user_id)
);

-- ── Forum Flags ──────────────────────────────────────────────────────────────
create table public.forum_flags (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references public.profiles on delete cascade,
  content_type text not null check (content_type in ('thread', 'reply')),
  content_id   uuid not null,
  reason       text,
  reviewed     boolean not null default false,
  created_at   timestamptz not null default now()
);
```

- [ ] **Step 2: Run migration in Supabase SQL Editor**

1. Go to your Supabase project → SQL Editor
2. Paste the full contents of `supabase/migrations/001_initial_schema.sql`
3. Click Run

Expected: All tables created with no errors. Verify in Table Editor: you should see `profiles`, `channels`, `messages`, `reactions`, `study_sessions`, `connection_requests`, `dm_threads`, `dm_messages`, `forum_categories`, `forum_threads`, `forum_replies`, `forum_reply_helpful_marks`, `forum_flags`.

- [ ] **Step 3: Commit the migration file**

```bash
git add supabase/migrations/001_initial_schema.sql
git commit -m "feat: add community database schema migration"
```

---

### Task 4: Seed Chat Channels

**Files:**

- Create: `supabase/migrations/002_seed_channels.sql`

- [ ] **Step 1: Create the seed file**

Create `supabase/migrations/002_seed_channels.sql`:

```sql
-- Pre-seeded channels. State channels are created on demand by application logic
-- when 3+ members from a state register (not seeded here).
insert into public.channels (slug, label, type, exam_track) values
  ('lcsw-study',         '#lcsw-study',          'exam',    'LCSW'),
  ('lmsw-study',         '#lmsw-study',          'exam',    'LMSW'),
  ('bsw-study',          '#bsw-study',           'exam',    'BSW'),
  ('introductions',      '#introductions',        'general', null),
  ('exam-day-tips',      '#exam-day-tips',        'general', null),
  ('passed-celebrations','#passed-celebrations',  'general', null);

-- Seed forum categories
insert into public.forum_categories (slug, label, sort_order) values
  ('exam-questions',    'Exam Questions',    1),
  ('state-requirements','State Requirements', 2),
  ('study-resources',   'Study Resources',   3),
  ('passed-stories',    'Passed! Stories',   4),
  ('study-groups',      'Study Groups',      5);
```

- [ ] **Step 2: Run seed in Supabase SQL Editor**

Paste and run `supabase/migrations/002_seed_channels.sql`.

Expected: 6 rows in `channels`, 5 rows in `forum_categories`.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_seed_channels.sql
git commit -m "feat: seed default chat channels and forum categories"
```

---

### Task 5: Row-Level Security Policies

**Files:**

- Create: `supabase/migrations/003_rls_policies.sql`

- [ ] **Step 1: Create the RLS policy file**

Create `supabase/migrations/003_rls_policies.sql`:

```sql
-- Enable RLS on every community table
alter table public.profiles              enable row level security;
alter table public.channels              enable row level security;
alter table public.messages              enable row level security;
alter table public.reactions             enable row level security;
alter table public.study_sessions        enable row level security;
alter table public.connection_requests   enable row level security;
alter table public.dm_threads            enable row level security;
alter table public.dm_messages           enable row level security;
alter table public.forum_categories      enable row level security;
alter table public.forum_threads         enable row level security;
alter table public.forum_replies         enable row level security;
alter table public.forum_reply_helpful_marks enable row level security;
alter table public.forum_flags           enable row level security;

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Any signed-in user can read all profiles (needed for matching/forums).
-- Users can only update their own profile.
create policy "profiles: authenticated read"
  on public.profiles for select
  to authenticated using (true);

create policy "profiles: own update"
  on public.profiles for update
  to authenticated using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin inserts profiles via service role (bypasses RLS) — no insert policy needed.

-- ── channels ─────────────────────────────────────────────────────────────────
create policy "channels: authenticated read"
  on public.channels for select
  to authenticated using (true);

-- ── messages ─────────────────────────────────────────────────────────────────
create policy "messages: authenticated read"
  on public.messages for select
  to authenticated using (true);

create policy "messages: authenticated insert"
  on public.messages for insert
  to authenticated with check (auth.uid() = author_id);

create policy "messages: own delete"
  on public.messages for delete
  to authenticated using (auth.uid() = author_id);

-- ── reactions ────────────────────────────────────────────────────────────────
create policy "reactions: authenticated read"
  on public.reactions for select
  to authenticated using (true);

create policy "reactions: authenticated insert"
  on public.reactions for insert
  to authenticated with check (auth.uid() = author_id);

create policy "reactions: own delete"
  on public.reactions for delete
  to authenticated using (auth.uid() = author_id);

-- ── study_sessions ───────────────────────────────────────────────────────────
create policy "sessions: authenticated read"
  on public.study_sessions for select
  to authenticated using (true);

create policy "sessions: authenticated insert"
  on public.study_sessions for insert
  to authenticated with check (auth.uid() = host_id);

create policy "sessions: host update"
  on public.study_sessions for update
  to authenticated using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

-- ── connection_requests ───────────────────────────────────────────────────────
create policy "connections: parties read"
  on public.connection_requests for select
  to authenticated using (auth.uid() = from_id or auth.uid() = to_id);

create policy "connections: sender insert"
  on public.connection_requests for insert
  to authenticated with check (auth.uid() = from_id);

create policy "connections: recipient update"
  on public.connection_requests for update
  to authenticated using (auth.uid() = to_id)
  with check (auth.uid() = to_id);

-- ── dm_threads ────────────────────────────────────────────────────────────────
create policy "dm_threads: participants read"
  on public.dm_threads for select
  to authenticated using (
    auth.uid() = participant_a or auth.uid() = participant_b
  );

-- Inserted by server-side code via service role after connection accepted.

-- ── dm_messages ───────────────────────────────────────────────────────────────
create policy "dm_messages: participants read"
  on public.dm_messages for select
  to authenticated using (
    exists (
      select 1 from public.dm_threads t
      where t.id = thread_id
        and (t.participant_a = auth.uid() or t.participant_b = auth.uid())
    )
  );

create policy "dm_messages: participants insert"
  on public.dm_messages for insert
  to authenticated with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.dm_threads t
      where t.id = thread_id
        and (t.participant_a = auth.uid() or t.participant_b = auth.uid())
    )
  );

-- ── forum_categories ──────────────────────────────────────────────────────────
-- Public read — anonymous visitors can see category names.
create policy "forum_categories: public read"
  on public.forum_categories for select
  using (true);

-- ── forum_threads ─────────────────────────────────────────────────────────────
create policy "forum_threads: authenticated read"
  on public.forum_threads for select
  to authenticated using (true);

create policy "forum_threads: authenticated insert"
  on public.forum_threads for insert
  to authenticated with check (auth.uid() = author_id);

-- Author or staff can update (staff flag checked via profiles join).
create policy "forum_threads: author or staff update"
  on public.forum_threads for update
  to authenticated using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_staff = true)
  );

create policy "forum_threads: author or staff delete"
  on public.forum_threads for delete
  to authenticated using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_staff = true)
  );

-- ── forum_replies ─────────────────────────────────────────────────────────────
create policy "forum_replies: authenticated read"
  on public.forum_replies for select
  to authenticated using (true);

create policy "forum_replies: authenticated insert"
  on public.forum_replies for insert
  to authenticated with check (auth.uid() = author_id);

create policy "forum_replies: author or staff update"
  on public.forum_replies for update
  to authenticated using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_staff = true)
  );

create policy "forum_replies: author or staff delete"
  on public.forum_replies for delete
  to authenticated using (
    auth.uid() = author_id
    or exists (select 1 from public.profiles where id = auth.uid() and is_staff = true)
  );

-- ── forum_reply_helpful_marks ─────────────────────────────────────────────────
create policy "helpful_marks: authenticated read"
  on public.forum_reply_helpful_marks for select
  to authenticated using (true);

create policy "helpful_marks: own insert"
  on public.forum_reply_helpful_marks for insert
  to authenticated with check (auth.uid() = user_id);

create policy "helpful_marks: own delete"
  on public.forum_reply_helpful_marks for delete
  to authenticated using (auth.uid() = user_id);

-- ── forum_flags ───────────────────────────────────────────────────────────────
create policy "flags: authenticated insert"
  on public.forum_flags for insert
  to authenticated with check (auth.uid() = reporter_id);

-- Only staff can read flags (for review queue).
create policy "flags: staff read"
  on public.forum_flags for select
  to authenticated using (
    exists (select 1 from public.profiles where id = auth.uid() and is_staff = true)
  );

-- ── pg_cron: expire pending connection requests after 7 days ─────────────────
-- Requires pg_cron extension enabled in Supabase (Database → Extensions → pg_cron).
-- Run this separately in SQL Editor AFTER enabling pg_cron:
--
-- select cron.schedule(
--   'expire-connection-requests',
--   '0 * * * *',   -- every hour
--   $$
--     update public.connection_requests
--     set status = 'expired', resolved_at = now()
--     where status = 'pending'
--       and created_at < now() - interval '7 days'
--   $$
-- );
```

- [ ] **Step 2: Run RLS policies in Supabase SQL Editor**

Paste and run `supabase/migrations/003_rls_policies.sql` (stop before the `pg_cron` comment — that's a separate step).

Expected: No errors. In Supabase → Table Editor → select any table → Auth Policies: policies should appear.

- [ ] **Step 3: Enable pg_cron and schedule expiry job**

In Supabase → Database → Extensions → search for `pg_cron` → Enable.

Then run in SQL Editor:

```sql
select cron.schedule(
  'expire-connection-requests',
  '0 * * * *',
  $$
    update public.connection_requests
    set status = 'expired', resolved_at = now()
    where status = 'pending'
      and created_at < now() - interval '7 days'
  $$
);
```

Expected: Returns a job ID integer.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/003_rls_policies.sql
git commit -m "feat: add RLS policies and pg_cron expiry job for connection requests"
```

---

### Task 6: Supabase Client Library

**Files:**

- Create: `src/lib/supabase.ts`

- [ ] **Step 1: Write the failing test first**

Create `src/__tests__/auth-utils.test.ts` with a placeholder that will drive the next task:

```typescript
import { describe, it, expect } from 'vitest'

// Tests will be added as utilities are created.
// This file exists to verify the test harness works.
describe('auth-utils placeholder', () => {
  it('vitest is configured', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify harness works**

```bash
npx vitest run
```

Expected: `1 passed`. If it fails with a module resolution error, verify `vitest.config.ts` alias path matches the project root.

- [ ] **Step 3: Create the Supabase client library**

Create `src/lib/supabase.ts`:

```typescript
import {
  createBrowserClient,
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

/**
 * Browser client — use inside React islands.
 * Reads/writes the session from browser cookies automatically.
 */
export function getBrowserClient() {
  return createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  )
}

/**
 * Server client — use inside Astro API routes.
 * Reads session from request cookies; writes new Set-Cookie headers to
 * responseHeaders so the caller can attach them to the Response.
 *
 * Usage:
 *   const responseHeaders = new Headers()
 *   const supabase = getServerClient(request, responseHeaders)
 *   // ... auth operations ...
 *   return new Response(body, { headers: responseHeaders })
 */
export function getServerClient(request: Request, responseHeaders: Headers) {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '')
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            responseHeaders.append(
              'Set-Cookie',
              serializeCookieHeader(name, value, options),
            )
          })
        },
      },
    },
  )
}

/**
 * Admin client — uses the service role key, bypasses RLS.
 * SERVER SIDE ONLY. Never instantiate in browser code or React islands.
 */
export function getAdminClient() {
  return createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase.ts src/__tests__/auth-utils.test.ts
git commit -m "feat: add Supabase client factory (browser, server, admin)"
```

---

### Task 7: Community TypeScript Types

**Files:**

- Create: `src/lib/community-types.ts`
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Create community-types.ts**

Create `src/lib/community-types.ts`:

```typescript
// ── Auth / Profile ────────────────────────────────────────────────────────────

export type StudyStage =
  | 'just_started'
  | 'actively_studying'
  | 'exam_scheduled'
  | 'passed'

export type CommunityExamTrack = 'BSW' | 'LMSW' | 'LCSW'

export interface CommunityUser {
  id: string
  thinkific_id: string
  display_name: string
  avatar_url: string | null
  exam_track: CommunityExamTrack | null
  state: string | null
  study_stage: StudyStage | null
  seeking_partner: boolean
  is_staff: boolean
  last_active_at: string
  created_at: string
}

// Profile is incomplete if exam_track or state is null (triggers setup modal).
export function isProfileComplete(user: CommunityUser): boolean {
  return user.exam_track !== null && user.state !== null && user.study_stage !== null
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export type ChannelType = 'exam' | 'state' | 'general' | 'session'

export interface Channel {
  id: string
  slug: string
  label: string
  type: ChannelType
  exam_track: CommunityExamTrack | null
  state: string | null
  created_at: string
}

export type ReactionEmoji = '👍' | '🧠' | '🎉' | '❤️'

export interface Message {
  id: string
  channel_id: string
  author_id: string
  body: string
  pinned: boolean
  created_at: string
  author?: Pick<CommunityUser, 'display_name' | 'avatar_url' | 'is_staff'>
  reactions?: { emoji: ReactionEmoji; count: number; reacted_by_me: boolean }[]
}

export interface StudySession {
  id: string
  host_id: string
  title: string
  exam_track: CommunityExamTrack | null
  starts_at: string
  ended_at: string | null
  channel_id: string | null
  host?: Pick<CommunityUser, 'display_name' | 'avatar_url'>
}

// ── Peer Matching ─────────────────────────────────────────────────────────────

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface ConnectionRequest {
  id: string
  from_id: string
  to_id: string
  status: ConnectionStatus
  created_at: string
  resolved_at: string | null
}

export interface DmThread {
  id: string
  participant_a: string
  participant_b: string
  created_at: string
}

export interface DmMessage {
  id: string
  thread_id: string
  author_id: string
  body: string
  created_at: string
}

// ── Forums ────────────────────────────────────────────────────────────────────

export interface ForumCategory {
  id: string
  slug: string
  label: string
  sort_order: number
}

export interface ForumThread {
  id: string
  author_id: string
  category_id: string
  title: string
  body: string
  exam_track: CommunityExamTrack | null
  state: string | null
  pinned: boolean
  locked: boolean
  created_at: string
  author?: Pick<CommunityUser, 'display_name' | 'avatar_url' | 'is_staff'>
  reply_count?: number
}

export interface ForumReply {
  id: string
  thread_id: string
  parent_id: string | null
  author_id: string
  body: string
  created_at: string
  helpful_count?: number
  marked_helpful_by_me?: boolean
  author?: Pick<CommunityUser, 'display_name' | 'avatar_url' | 'is_staff'>
}
```

- [ ] **Step 2: Add CommunityUser re-export to src/lib/types.ts**

Open `src/lib/types.ts`. At the very end of the file, add:

```typescript
// Community types (re-exported for convenience)
export type { CommunityUser } from '@/lib/community-types'
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/community-types.ts src/lib/types.ts
git commit -m "feat: add community TypeScript types"
```

---

### Task 8: Auth Utility Functions (Unit-Testable)

**Files:**

- Create: `src/lib/auth-utils.ts`
- Modify: `src/__tests__/auth-utils.test.ts`

- [ ] **Step 1: Write failing tests first**

Replace the contents of `src/__tests__/auth-utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  buildThinkificAuthUrl,
  parseThinkificUserResponse,
  normalizeDmParticipants,
} from '@/lib/auth-utils'

describe('buildThinkificAuthUrl', () => {
  it('includes client_id, redirect_uri, state, and response_type', () => {
    const url = new URL(
      buildThinkificAuthUrl({
        clientId: 'test-client',
        redirectUri: 'https://example.com/api/auth/callback',
        state: 'abc123',
      }),
    )
    expect(url.searchParams.get('client_id')).toBe('test-client')
    expect(url.searchParams.get('redirect_uri')).toBe(
      'https://example.com/api/auth/callback',
    )
    expect(url.searchParams.get('state')).toBe('abc123')
    expect(url.searchParams.get('response_type')).toBe('code')
  })
})

describe('parseThinkificUserResponse', () => {
  it('extracts id, email, and display_name from API response shape', () => {
    const raw = {
      data: {
        id: 42,
        email: 'student@example.com',
        first_name: 'Jane',
        last_name: 'Smith',
        avatar_url: 'https://cdn.example.com/avatar.png',
      },
    }
    const user = parseThinkificUserResponse(raw)
    expect(user.id).toBe('42')
    expect(user.email).toBe('student@example.com')
    expect(user.display_name).toBe('Jane Smith')
    expect(user.avatar_url).toBe('https://cdn.example.com/avatar.png')
  })

  it('handles missing last_name gracefully', () => {
    const raw = {
      data: { id: 7, email: 'a@b.com', first_name: 'Solo', last_name: null, avatar_url: null },
    }
    const user = parseThinkificUserResponse(raw)
    expect(user.display_name).toBe('Solo')
  })

  it('throws if required fields are missing', () => {
    expect(() => parseThinkificUserResponse({ data: { id: null } })).toThrow()
  })
})

describe('normalizeDmParticipants', () => {
  it('always returns lower UUID as participant_a', () => {
    const a = '00000000-0000-0000-0000-000000000001'
    const b = '00000000-0000-0000-0000-000000000002'
    expect(normalizeDmParticipants(a, b)).toEqual({ participant_a: a, participant_b: b })
    expect(normalizeDmParticipants(b, a)).toEqual({ participant_a: a, participant_b: b })
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run
```

Expected: 4 failing tests with `Cannot find module '@/lib/auth-utils'`.

- [ ] **Step 3: Implement auth-utils.ts**

Create `src/lib/auth-utils.ts`:

```typescript
// ── Thinkific OAuth URL Builder ───────────────────────────────────────────────

interface ThinkificAuthUrlOptions {
  clientId: string
  redirectUri: string
  state: string
}

export function buildThinkificAuthUrl(opts: ThinkificAuthUrlOptions): string {
  const params = new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    response_type: 'code',
    scope: 'user:read',
    state: opts.state,
  })
  return `https://api.thinkific.com/oauth/authorize?${params}`
}

// ── Thinkific API Response Parser ─────────────────────────────────────────────

export interface ParsedThinkificUser {
  id: string           // Thinkific user ID as string
  email: string
  display_name: string
  avatar_url: string | null
}

export function parseThinkificUserResponse(raw: unknown): ParsedThinkificUser {
  const data = (raw as { data?: Record<string, unknown> }).data
  if (!data?.id || !data?.email) {
    throw new Error('Thinkific user response missing required fields: id, email')
  }
  const firstName = typeof data.first_name === 'string' ? data.first_name : ''
  const lastName = typeof data.last_name === 'string' ? data.last_name : ''
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Anonymous'
  return {
    id: String(data.id),
    email: String(data.email),
    display_name: displayName,
    avatar_url: typeof data.avatar_url === 'string' ? data.avatar_url : null,
  }
}

// ── DM Thread Participant Normalizer ──────────────────────────────────────────
// The dm_threads table requires participant_a < participant_b (lexicographic UUID
// comparison) to prevent duplicate rows for the same pair.

export function normalizeDmParticipants(
  userId1: string,
  userId2: string,
): { participant_a: string; participant_b: string } {
  return userId1 < userId2
    ? { participant_a: userId1, participant_b: userId2 }
    : { participant_a: userId2, participant_b: userId1 }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run
```

Expected: `4 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth-utils.ts src/__tests__/auth-utils.test.ts
git commit -m "feat: add auth utility functions with tests"
```

---

### Task 9: Thinkific OAuth Initiation Route

**Files:**

- Create: `src/pages/api/auth/thinkific.ts`

- [ ] **Step 1: Create the route**

Create `src/pages/api/auth/thinkific.ts`:

```typescript
import type { APIRoute } from 'astro'
import { buildThinkificAuthUrl } from '@/lib/auth-utils'

export const prerender = false

export const GET: APIRoute = ({ redirect, cookies }) => {
  const state = crypto.randomUUID()

  // Store state in a short-lived httpOnly cookie to verify in the callback.
  cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  const authUrl = buildThinkificAuthUrl({
    clientId: import.meta.env.THINKIFIC_CLIENT_ID,
    redirectUri: `${import.meta.env.PUBLIC_SITE_URL}/api/auth/callback`,
    state,
  })

  return redirect(authUrl, 302)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/api/auth/thinkific.ts
git commit -m "feat: add Thinkific OAuth initiation route"
```

---

### Task 10: Thinkific OAuth Callback Route

**Files:**

- Create: `src/pages/api/auth/callback.ts`

- [ ] **Step 1: Create the callback route**

Create `src/pages/api/auth/callback.ts`:

```typescript
import type { APIRoute } from 'astro'
import { getAdminClient, getServerClient } from '@/lib/supabase'
import { parseThinkificUserResponse } from '@/lib/auth-utils'

export const prerender = false

async function exchangeThinkificCode(code: string, redirectUri: string): Promise<string> {
  const res = await fetch('https://api.thinkific.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: import.meta.env.THINKIFIC_CLIENT_ID,
      client_secret: import.meta.env.THINKIFIC_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok) throw new Error(`Thinkific token exchange failed: ${res.status}`)
  const { access_token } = await res.json()
  if (!access_token) throw new Error('No access_token in Thinkific response')
  return access_token
}

async function fetchThinkificProfile(accessToken: string) {
  const res = await fetch('https://api.thinkific.com/api/v1/users/current', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(`Thinkific user fetch failed: ${res.status}`)
  return res.json()
}

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const storedState = cookies.get('oauth_state')?.value

  // Clear CSRF state cookie immediately.
  cookies.delete('oauth_state', { path: '/' })

  if (!code || !state || !storedState || state !== storedState) {
    return redirect('/?auth_error=invalid_state', 302)
  }

  try {
    const redirectUri = `${import.meta.env.PUBLIC_SITE_URL}/api/auth/callback`

    // 1. Exchange authorization code for Thinkific access token.
    const accessToken = await exchangeThinkificCode(code, redirectUri)

    // 2. Fetch Thinkific user profile.
    const rawProfile = await fetchThinkificProfile(accessToken)
    const thinkificUser = parseThinkificUserResponse(rawProfile)

    const admin = getAdminClient()

    // 3. Find or create the Supabase user.
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('thinkific_id', thinkificUser.id)
      .single()

    if (!existingProfile) {
      // New user — create auth user then profile.
      const { data: authData, error: createError } = await admin.auth.admin.createUser({
        email: thinkificUser.email,
        email_confirm: true,
        user_metadata: { thinkific_id: thinkificUser.id },
      })

      if (createError) {
        // "User already registered" means the email exists in auth.users but no
        // profile was created for this Thinkific ID. Fall through to generateLink.
        if (!createError.message.includes('already registered')) throw createError
      } else if (authData?.user) {
        await admin.from('profiles').insert({
          id: authData.user.id,
          thinkific_id: thinkificUser.id,
          display_name: thinkificUser.display_name,
          avatar_url: thinkificUser.avatar_url,
        })
      }
    } else {
      // Returning user — refresh activity and avatar.
      await admin
        .from('profiles')
        .update({
          last_active_at: new Date().toISOString(),
          avatar_url: thinkificUser.avatar_url,
        })
        .eq('thinkific_id', thinkificUser.id)
    }

    // 4. Generate a magic-link token for this email (works whether user is new
    //    or existing) and immediately verify it server-side to obtain a session.
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: 'magiclink',
        email: thinkificUser.email,
      })

    if (linkError || !linkData?.properties?.hashed_token) {
      throw linkError ?? new Error('generateLink returned no hashed_token')
    }

    // 5. Exchange token for a session — @supabase/ssr sets the session cookies
    //    on responseHeaders via the setAll cookie handler.
    const responseHeaders = new Headers()
    const serverClient = getServerClient(request, responseHeaders)

    const { error: verifyError } = await serverClient.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: 'email',
    })

    if (verifyError) throw verifyError

    // 6. Redirect to community hub with session cookies set.
    responseHeaders.set('Location', '/community')
    return new Response(null, { status: 302, headers: responseHeaders })
  } catch (err) {
    console.error('[auth/callback] error:', err)
    return redirect('/?auth_error=auth_failed', 302)
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/api/auth/callback.ts
git commit -m "feat: add Thinkific OAuth callback route with Supabase session creation"
```

---

### Task 11: Sign Out Route

**Files:**

- Create: `src/pages/api/auth/signout.ts`

- [ ] **Step 1: Create the route**

Create `src/pages/api/auth/signout.ts`:

```typescript
import type { APIRoute } from 'astro'
import { getServerClient } from '@/lib/supabase'

export const prerender = false

export const POST: APIRoute = async ({ request, redirect }) => {
  const responseHeaders = new Headers()
  const supabase = getServerClient(request, responseHeaders)
  await supabase.auth.signOut()
  // setAll will append Set-Cookie headers that clear the session cookies.
  responseHeaders.set('Location', '/')
  return new Response(null, { status: 302, headers: responseHeaders })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/api/auth/signout.ts
git commit -m "feat: add sign-out route"
```

---

### Task 12: AuthButton Island

**Files:**

- Create: `src/components/islands/AuthButton.tsx`

- [ ] **Step 1: Create the island**

Create `src/components/islands/AuthButton.tsx`:

```tsx
import { useEffect, useState } from 'react'
import { getBrowserClient } from '@/lib/supabase'
import type { CommunityUser } from '@/lib/community-types'
import UserMenu from './UserMenu'

export default function AuthButton() {
  const [user, setUser] = useState<CommunityUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getBrowserClient()

    // Read existing session on mount.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(profile ?? null)
      }
      setLoading(false)
    })

    // Keep session in sync across tabs.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setUser(profile ?? null)
        } else {
          setUser(null)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    // Render a same-size placeholder to avoid layout shift.
    return <span className="auth-btn-placeholder" aria-hidden="true" />
  }

  if (user) {
    return <UserMenu user={user} />
  }

  return (
    <a href="/api/auth/thinkific" className="btn-auth-signin" data-cta="sign-in" data-cta-location="header">
      Sign In
    </a>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/islands/AuthButton.tsx
git commit -m "feat: add AuthButton island with Supabase session listener"
```

---

### Task 13: UserMenu Island

**Files:**

- Create: `src/components/islands/UserMenu.tsx`

- [ ] **Step 1: Create the island**

Create `src/components/islands/UserMenu.tsx`:

```tsx
import { useState } from 'react'
import type { CommunityUser } from '@/lib/community-types'

interface Props {
  user: CommunityUser
}

export default function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false)

  const initials = user.display_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <div className="user-menu" style={{ position: 'relative' }}>
      <button
        className="user-menu-trigger"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        aria-label={`Account menu for ${user.display_name}`}
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt=""
            aria-hidden="true"
            className="user-avatar"
            width={32}
            height={32}
          />
        ) : (
          <span className="user-avatar-initials" aria-hidden="true">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Invisible overlay to close menu on outside click */}
          <div
            className="user-menu-overlay"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="user-menu-dropdown" role="menu">
            <div className="user-menu-name">{user.display_name}</div>
            <a href="/community" role="menuitem" onClick={() => setOpen(false)}>
              Community
            </a>
            <a href="/community/messages" role="menuitem" onClick={() => setOpen(false)}>
              Messages
            </a>
            <a href="/community/partners" role="menuitem" onClick={() => setOpen(false)}>
              Study Partners
            </a>
            <hr />
            <button role="menuitem" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/islands/UserMenu.tsx
git commit -m "feat: add UserMenu island with avatar, nav links, and sign-out"
```

---

### Task 14: Integrate AuthButton Into Header

**Files:**

- Modify: `src/components/Header.astro`

- [ ] **Step 1: Read current Header.astro**

Open [src/components/Header.astro](src/components/Header.astro) and locate the `</ul>` closing tag inside `<nav id="primary-nav">`.

- [ ] **Step 2: Add the import and island to Header.astro**

At the top of the frontmatter in `src/components/Header.astro`, add the import after the existing imports:

```astro
---
import type { NavItem, SiteSettings } from "@/lib/types";
import AuthButton from "@/components/islands/AuthButton";
// ... rest of existing frontmatter
```

Then, inside the `<nav id="primary-nav">` block, add `AuthButton` after the `</ul>` closing tag:

```astro
    <nav id="primary-nav" class="primary-nav" aria-label="Primary">
      <ul>
        {navItems.map((item) => (
          <li>
            <a
              href={item.href}
              class:list={{ "primary-link": item.primary, "btn-magnetic": item.primary }}
              data-cta={item.primary ? "header-primary" : undefined}
              data-cta-location={item.primary ? "header" : undefined}
              data-magnetic={item.primary || undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <AuthButton client:load />
    </nav>
```

- [ ] **Step 3: Run dev server and verify no build errors**

```bash
npm run dev
```

Open `http://localhost:4321` in a browser. Expected: Header renders. A "Sign In" link appears in the nav. No console errors. No TypeScript errors in the terminal.

- [ ] **Step 4: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: add AuthButton island to site header"
```

---

### Task 15: Profile Setup Modal

**Files:**

- Create: `src/components/islands/ProfileSetupModal.tsx`

- [ ] **Step 1: Create the modal**

Create `src/components/islands/ProfileSetupModal.tsx`:

```tsx
import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase'
import type { CommunityExamTrack, StudyStage } from '@/lib/community-types'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

interface Props {
  userId: string
  onComplete: () => void
}

export default function ProfileSetupModal({ userId, onComplete }: Props) {
  const [examTrack, setExamTrack] = useState<CommunityExamTrack | ''>('')
  const [state, setState] = useState('')
  const [studyStage, setStudyStage] = useState<StudyStage | ''>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!examTrack || !state || !studyStage) return

    setSaving(true)
    setError(null)

    const supabase = getBrowserClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ exam_track: examTrack, state, study_stage: studyStage })
      .eq('id', userId)

    if (updateError) {
      setError('Could not save your profile. Please try again.')
      setSaving(false)
      return
    }

    onComplete()
  }

  return (
    <div className="profile-setup-backdrop" role="dialog" aria-modal="true" aria-labelledby="profile-setup-title">
      <div className="profile-setup-modal">
        <h2 id="profile-setup-title">Quick profile setup</h2>
        <p>This helps us match you with the right study partners and content.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Which exam are you studying for?
            <select
              value={examTrack}
              onChange={(e) => setExamTrack(e.target.value as CommunityExamTrack)}
              required
            >
              <option value="">Select exam</option>
              <option value="LCSW">LCSW</option>
              <option value="LMSW">LMSW</option>
              <option value="BSW">BSW</option>
            </select>
          </label>

          <label>
            Your state
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            >
              <option value="">Select state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            Where are you in your journey?
            <select
              value={studyStage}
              onChange={(e) => setStudyStage(e.target.value as StudyStage)}
              required
            >
              <option value="">Select stage</option>
              <option value="just_started">Just started</option>
              <option value="actively_studying">Actively studying</option>
              <option value="exam_scheduled">Exam scheduled</option>
              <option value="passed">Already passed</option>
            </select>
          </label>

          {error && <p className="profile-setup-error" role="alert">{error}</p>}

          <button type="submit" disabled={saving || !examTrack || !state || !studyStage}>
            {saving ? 'Saving…' : 'Get started'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/islands/ProfileSetupModal.tsx
git commit -m "feat: add ProfileSetupModal island for first-time community profile setup"
```

---

### Task 16: Stub Community Page

**Files:**

- Create: `src/pages/community/index.astro`

The callback redirects to `/community` after sign-in. Without this page the auth flow ends in a 404. This stub renders the `ProfileSetupModal` for incomplete profiles and a placeholder for the full community hub (built in Plan 2).

- [ ] **Step 1: Create the stub page**

Create `src/pages/community/index.astro`:

```astro
---
import BaseLayout from "@/layouts/BaseLayout.astro";
import { getServerClient } from "@/lib/supabase";
import type { CommunityUser } from "@/lib/community-types";
import { isProfileComplete } from "@/lib/community-types";
import ProfileSetupModal from "@/components/islands/ProfileSetupModal";

export const prerender = false;

const responseHeaders = new Headers();
const supabase = getServerClient(Astro.request, responseHeaders);
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  return Astro.redirect("/api/auth/thinkific");
}

const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", session.user.id)
  .single();

const user = profile as CommunityUser | null;
const needsSetup = !user || !isProfileComplete(user);
---

<BaseLayout title="Community — Agents of Change" description="Connect with fellow social work exam students.">
  {needsSetup && user && (
    <ProfileSetupModal
      client:load
      userId={user.id}
      onComplete={() => window.location.reload()}
    />
  )}

  <section style="padding: 4rem 2rem; text-align: center;">
    <h1>Community Hub</h1>
    <p>Coming soon: real-time study channels, peer matching, and discussion forums.</p>
    {user && <p>Welcome, {user.display_name}!</p>}
  </section>
</BaseLayout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/community/index.astro
git commit -m "feat: add community stub page with profile setup and auth guard"
```

---

### Task 17: End-to-End Manual Test Checklist

Before marking this plan complete, walk through the following manually:

- [ ] **Sign In flow**
  1. Click "Sign In" in the header
  2. Redirected to Thinkific OAuth page
  3. Authorize → redirected back to `/community`
  4. Header shows user avatar / initials instead of "Sign In"

- [ ] **First-time user sees profile setup**
  1. On first sign-in, `exam_track` and `state` are null
  2. The community page should show `ProfileSetupModal`
  3. Completing it saves the values to Supabase `profiles` table
  4. Modal does not appear on subsequent visits

- [ ] **Sign Out flow**
  1. Click avatar → "Sign Out"
  2. Redirected to `/`
  3. Header shows "Sign In" again
  4. Navigating back to `/community` redirects to sign-in (next plan adds this guard)

- [ ] **Verify RLS is enforced**
  1. In Supabase Table Editor, confirm your profile row exists in `profiles`
  2. Using the anon key in browser dev tools, attempt to call `profiles.update` for a different user's row — should fail with RLS error

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: community platform auth foundation complete (Plan 1 of 4)"
```

> **Note:** Task 16 step 2 requires the stub community page from Task 16 (above) to be in place first.

---

## What's Next

This plan delivers a working auth foundation. The three remaining plans build on it:

- **Plan 2:** Real-time chat channels + live study sessions + LiveNow bar
- **Plan 3:** Peer matching + connection requests + DM threads
- **Plan 4:** Discussion forums + social proof (activity ticker, contextual nudges, presence counter)

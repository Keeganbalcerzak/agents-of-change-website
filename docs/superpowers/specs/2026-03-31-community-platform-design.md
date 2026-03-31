# Community Platform Design

**Date:** 2026-03-31
**Project:** Agents of Change — Website Functional Improvements
**Priority order:** Engagement → New Features → SEO/Content → Conversion

---

## Overview

Add a community layer to the existing Agents of Change website (Astro + React + Vercel) using Supabase as the real-time backend and Thinkific OAuth for student authentication. Students use their existing Thinkific login — no new password. The community features are embedded directly in the site, not linked to an external platform.

**Goals:**

1. Give students a reason to return to the site between study sessions
2. Build peer connection through real-time chat, study sessions, and peer matching
3. Surface organic social proof from real student activity
4. Enrich existing site pages (state requirements, exam prep) with community context

---

## Section 1: Authentication & User Identity

### Flow

1. Student clicks "Sign In" → redirected to Thinkific OAuth
2. Returns with session → Supabase Auth creates/updates a local user profile
3. Signed-in students see: avatar in nav, "Community" link, notification badge
4. Anonymous visitors see the full public site unchanged — community features are gated

### Supabase User Profile Schema

```sql
profiles (
  id              uuid PRIMARY KEY references auth.users,
  thinkific_id    text UNIQUE NOT NULL,
  display_name    text NOT NULL,
  avatar_url      text,
  exam_track      text CHECK (exam_track IN ('BSW','LMSW','LCSW')),
  state           text,           -- US state abbreviation
  study_stage     text CHECK (study_stage IN ('just_started','actively_studying','exam_scheduled','passed')),
  seeking_partner boolean DEFAULT false,
  is_staff        boolean DEFAULT false,  -- controls verified badge in forums and chat
  last_active_at  timestamptz DEFAULT now(),
  created_at      timestamptz DEFAULT now()
)
```

### Notes

- No new passwords — Thinkific OAuth is the sole identity source
- Row-level security (RLS) on all Supabase tables: users can only read/write their own private data; public profile fields are readable by all authenticated users
- Profile setup is prompted inline on first community page visit (takes ~30 seconds)

---

## Section 2: Real-Time Chat & Live Study Sessions

### Channel Structure

| Channel type | Examples | Creation |
| --- | --- | --- |
| Exam-specific | `#lcsw-study`, `#lmsw-study`, `#bsw-study` | Pre-seeded |
| State-specific | `#california`, `#new-york` | Auto-created when 3+ members from that state |
| General | `#introductions`, `#exam-day-tips`, `#passed-celebrations` | Pre-seeded |
| Live sessions | Temporary rooms | Student-created |

### Real-Time Features (Supabase Realtime)

- Instant message delivery via WebSocket subscriptions
- Typing indicators ("Sarah is typing...")
- Presence — online indicator (green dot) per channel
- Unread counts in nav badge

### Channel & Message Schema

```sql
channels (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,   -- e.g. "lcsw-study", "california"
  label       text NOT NULL,
  type        text CHECK (type IN ('exam','state','general','session')),
  exam_track  text,                   -- set for exam-type channels
  state       text,                   -- set for state-type channels
  created_at  timestamptz DEFAULT now()
)

messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id  uuid REFERENCES channels(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES profiles(id),
  body        text NOT NULL,          -- markdown supported
  pinned      boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
)

reactions (
  message_id  uuid REFERENCES messages(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES profiles(id),
  emoji       text NOT NULL,          -- limited set: 👍 🧠 🎉 ❤️
  PRIMARY KEY (message_id, author_id, emoji)
)
```

### Live Study Sessions

- Any student can schedule a session (topic, exam track, date/time)
- Active sessions appear in a "Live Now" site-wide bar (slim banner)
- Session chat uses the same Realtime infrastructure as channels, scoped to the session's channel
- Session history remains visible after the session ends
- Future upgrade path: add Zoom/Google Meet link field (no video built in initially)

### Session Schema

```sql
study_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id     uuid REFERENCES profiles(id),
  title       text NOT NULL,
  exam_track  text,
  starts_at   timestamptz NOT NULL,
  ended_at    timestamptz,
  channel_id  uuid REFERENCES channels(id)
)
```

---

## Section 3: Peer Matching

### Matching Logic

Matching runs as a Postgres query when a student visits the "Study Partners" page or enables peer matching on their profile.

**Match score (computed, not stored):**

1. Same exam track — required (no cross-track matches)
2. Same state — +3 points
3. Study stage within 1 level — +2 points
4. Active in last 30 days — required (stale profiles excluded)
5. Not already connected — excluded from results

Returns top 3 matches, displayed as cards on the community dashboard.

### Connection Flow

1. Student A clicks "Connect" on Student B's match card
2. A `connection_requests` row is inserted with status `pending`
3. A notification appears in Student B's in-site badge
4. If Student B accepts, status becomes `accepted` and a DM thread is opened for both
5. Pending requests expire after 7 days via a Supabase scheduled function (pg_cron) that sets status to `expired`

### Connection & DM Schema

```sql
connection_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id      uuid REFERENCES profiles(id),
  to_id        uuid REFERENCES profiles(id),
  status       text CHECK (status IN ('pending','accepted','declined','expired')) DEFAULT 'pending',
  created_at   timestamptz DEFAULT now(),
  resolved_at  timestamptz,
  UNIQUE (from_id, to_id)
)

dm_threads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Always store lower uuid first to prevent duplicate (A,B)/(B,A) rows
  participant_a uuid REFERENCES profiles(id) CHECK (participant_a < participant_b),
  participant_b uuid REFERENCES profiles(id),
  created_at    timestamptz DEFAULT now(),
  UNIQUE (participant_a, participant_b)
)

dm_messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   uuid REFERENCES dm_threads(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES profiles(id),
  body        text NOT NULL,
  created_at  timestamptz DEFAULT now()
)
```

### Privacy

- Peer matching is **opt-in** (default off)
- Display name only — email, full name, and Thinkific identity are never exposed to other students
- Students can toggle "not looking right now" at any time without losing profile data
- RLS enforces: DM threads readable only by participants

---

## Section 4: Discussion Forums

### Category Structure

| Category | Purpose |
| --- | --- |
| Exam Questions | Content questions tagged by exam track |
| State Requirements | State-specific licensing questions (links to state pages) |
| Study Resources | Share and discover what's working |
| Passed! Stories | Celebration threads — doubles as social proof |
| Study Groups | Coordinate informal groups and sessions |

### Thread Model

- Any signed-in student can post
- Replies are threaded to 1 level deep (keeps it scannable)
- Upvote/"Helpful" on replies — no downvotes
- Instructors/staff get a verified badge (`is_staff = true` in profiles); their replies are visually elevated
- Threads tagged by exam track + state for filtering

### Forum Schema

```sql
forum_categories (
  id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug  text UNIQUE NOT NULL,  -- e.g. "exam-questions", "passed-stories"
  label text NOT NULL,
  sort_order int NOT NULL
)

forum_threads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   uuid REFERENCES profiles(id),
  category_id uuid REFERENCES forum_categories(id),
  title       text NOT NULL,
  body        text NOT NULL,
  exam_track  text,
  state       text,
  pinned      boolean DEFAULT false,
  locked      boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
)

forum_replies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id   uuid REFERENCES forum_threads(id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES forum_replies(id),  -- null = top-level reply
  author_id   uuid REFERENCES profiles(id),
  body        text NOT NULL,
  created_at  timestamptz DEFAULT now()
)

-- Separate table tracks who marked what helpful, preventing duplicate marks
forum_reply_helpful_marks (
  reply_id    uuid REFERENCES forum_replies(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES profiles(id),
  PRIMARY KEY (reply_id, user_id)
)

forum_flags (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id  uuid REFERENCES profiles(id),
  content_type text CHECK (content_type IN ('thread','reply')),
  content_id   uuid NOT NULL,
  reason       text,
  reviewed     boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
)
```

Helpful counts are computed at query time via `COUNT` on `forum_reply_helpful_marks` — not stored as a denormalized integer.

### Site Integration

- State requirement pages: "Community Questions" section at bottom — 3 most recent threads tagged for that state
- Exam prep pages: Relevant pinned threads surfaced inline
- This creates a content loop: site drives forum engagement, forums enrich site pages

### Moderation

- Flagging routes to a staff review queue (Supabase dashboard view initially)
- Flagged content is hidden pending review (not auto-removed)
- Staff actions: pin, lock, remove, mark as resolved

---

## Section 5: Live Activity & Social Proof

### Site-wide Indicators

- **Student counter** in nav/hero: "847 students currently studying" — Supabase presence aggregate, refreshed every 60s
- **Channel activity**: "12 people online in #lcsw-study" on the community page
- **Activity ticker** on home page: "Maria from Texas just passed her LCSW exam" — pulled from Passed! forum category with a 10-minute delay (prevents gaming)

### Contextual Nudges

| Page | Nudge |
| --- | --- |
| Exam prep | "23 students studying for LCSW this week in your state" |
| State requirements | "See what other [State] social workers are asking →" (links to filtered forum) |
| Trial signup | "Join 847 students already studying with Agents of Change" |

### Live Now Bar

- Slim banner appears site-wide when a live study session is active
- Shows: topic, host name, participant count, "Join" button
- Disappears automatically when session ends
- Maximum 1 bar shown (most recent active session if multiple overlap)

### Privacy

- All counters are anonymous aggregates
- Activity ticker only shows names/states from students who posted publicly in the Passed! forum
- No individual tracking exposed to other users

---

## Technical Architecture

### Stack Summary

| Layer | Technology |
| --- | --- |
| Auth | Supabase Auth + Thinkific OAuth 2.0 |
| Database | Supabase Postgres with RLS |
| Real-time | Supabase Realtime (WebSocket channels) |
| Frontend | React islands in existing Astro site |
| Hosting | Vercel (no change) |
| CMS | Sanity (no change) |

### New Environment Variables Required

```bash
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-side only
THINKIFIC_CLIENT_ID=your_thinkific_oauth_client_id
THINKIFIC_CLIENT_SECRET=your_thinkific_oauth_secret
```

### New Astro API Routes

- `GET /api/auth/thinkific` — initiates Thinkific OAuth flow
- `GET /api/auth/callback` — handles OAuth callback, creates Supabase session
- `POST /api/auth/signout` — clears session
- `GET /api/community/presence` — aggregate presence counts (public, cached)

### New React Islands

- `CommunityLayout` — wrapper with auth state, nav badge, notifications
- `ChatChannel` — real-time channel view with message list, input, presence
- `StudySessionScheduler` — create/join study sessions
- `PeerMatchingPanel` — match cards + connect flow
- `DMThread` — private message thread view
- `ForumBoard` — category listing + thread list with filters
- `ForumThread` — thread detail with replies
- `ActivityTicker` — animated social proof ticker
- `LiveNowBar` — site-wide live session banner

### New Pages

- `/community` — hub page (channels, sessions, partner matching)
- `/community/channel/[slug]` — individual channel view
- `/community/forum/[category]` — forum category page
- `/community/forum/thread/[id]` — thread detail page
- `/community/partners` — peer matching browser
- `/community/messages` — DM inbox

---

## Estimated Infrastructure Cost

| Service | Tier | Monthly Cost |
| --- | --- | --- |
| Supabase | Pro ($25/mo) | $25 |
| Supabase Realtime | Included in Pro (500 concurrent connections) | $0 |
| Vercel | Pro (existing) | $0 additional |
| **Total new spend** | | **~$25/mo to start** |

Scales to ~$75–150/mo at high activity (1,000+ concurrent users). Free tier sufficient for development and early testing.

---

## Out of Scope (This Spec)

- Video/audio in study sessions (future: Zoom/Meet link integration)
- Mobile app
- Email notification digests (future enhancement)
- Payment integration
- AI study tools
- Student dashboard / progress tracking
- SEO improvements (separate spec)
- Conversion optimization (separate spec)

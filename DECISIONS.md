# Architecture Decisions

This document records the reasoning behind significant technical choices made in NIGHT//OS. The format is loosely based on [Architecture Decision Records (ADRs)](https://adr.github.io/). Each entry captures the context, the decision, the alternatives considered, and the trade-offs.

These aren't "best practices." They're decisions specific to this project's constraints. Some would be wrong for a different project.

---

## ADR-001: Use Next.js App Router instead of Pages Router

**Date:** Phase 1 setup
**Status:** Accepted

### Context

Next.js has two routing systems: the older Pages Router (`pages/`) and the newer App Router (`app/`). Most tutorials and existing apps use the Pages Router. The App Router is the recommended default for new projects since Next.js 13.

### Decision

Use the App Router with React Server Components.

### Alternatives considered

1. **Pages Router.** More tutorials, more Stack Overflow answers, more familiar mental model.
2. **A non-Next.js framework** (Remix, SvelteKit, Astro). Different trade-offs entirely.

### Rationale

The App Router's Server Components fit our data access pattern perfectly: pages run on the server, query the database directly via Prisma, return rendered HTML. No `getServerSideProps`, no API routes for reads, no client-side data fetching.

This eliminates an entire layer of code (the `/api/*` routes) that the Pages Router would have required.

### Trade-offs accepted

- Smaller pool of community resources for novel patterns
- Server Actions are still relatively new (stable since Next.js 14)
- Some libraries don't yet support React Server Components (had to be careful with picks)

---

## ADR-002: Prisma over Drizzle, Kysely, or raw SQL

**Date:** Phase 2
**Status:** Accepted

### Context

Need a way to query Postgres from TypeScript. Several mature options exist.

### Decision

Prisma 6.

### Alternatives considered

1. **Drizzle ORM.** TypeScript-first, closer to SQL, faster runtime. Less mature ecosystem.
2. **Kysely.** Query builder (not full ORM). Most explicit, requires more boilerplate.
3. **Raw SQL via pg.** Most flexible, least type-safe.
4. **Supabase JS client.** Would tie us tightly to Supabase's REST API, give less type safety.

### Rationale

Prisma's generated types are exceptional. After defining the schema, every query returns precisely-typed objects. Refactoring schema is safer than any other option here.

### Trade-offs accepted

- Larger bundle size (Prisma client is ~10MB on disk)
- Sometimes-verbose API for complex queries
- Connection pooling needed care (resolved via Supabase pooler URL)
- Schema migrations through Prisma rather than Supabase's migration tools (slight friction)

---

## ADR-003: Supabase for Auth + Postgres rather than NextAuth + separate DB

**Date:** Phase 2
**Status:** Accepted

### Context

Need authentication (email/password) and a Postgres database. Many combinations possible.

### Decision

Supabase, using both their auth service and their hosted Postgres.

### Alternatives considered

1. **NextAuth.js + Vercel Postgres.** Popular Next.js stack. NextAuth has more provider options.
2. **Clerk + any DB.** Easiest auth, but $25/month after free tier.
3. **Lucia Auth + any DB.** Code-first auth, more control, more setup.
4. **Roll-your-own auth + bcrypt + JWT.** Maximum control, maximum risk.

### Rationale

Supabase combines hosted Postgres with battle-tested auth in one product with a generous free tier (50K MAUs, 500MB storage). Mumbai region available for low latency. RLS is integrated. The `@supabase/ssr` package handles cookie-based session management for Next.js correctly.

### Trade-offs accepted

- Locked into Supabase's auth schema (e.g., the `auth.users` table). Migrating off would require porting users.
- Less control over auth flow than rolling our own
- The dashboard UI changes frequently (caused friction during initial setup)
- Confirmation emails come from a Supabase-branded domain by default

---

## ADR-004: Server Components for reads, Server Actions for writes, no API routes

**Date:** Phase 3
**Status:** Accepted

### Context

In a typical React app, data flow looks like: Client to fetch('/api/*') to API handler to DB to JSON response to Client state. This is a lot of serialization boundaries.

### Decision

Use Server Components to read data (direct Prisma to rendered HTML). Use Server Actions for mutations (typed RPC, no JSON serialization at the user's level). Do not create any `/api/*` routes.

### Alternatives considered

1. **REST API with TanStack Query on the client.** Familiar pattern, but adds a layer.
2. **tRPC.** Type-safe RPC, but Server Actions cover the same use case natively.
3. **GraphQL.** Overkill for our scale.

### Rationale

The whole stack is TypeScript. We control both ends. Adding an API layer means converting typed objects to JSON and back, and maintaining contract types in two places. Server Actions let us call a typed function from a client component as if it were local. The framework handles serialization invisibly.

### Trade-offs accepted

- Harder to share the backend with a future mobile app or third-party (no public API)
- Every page is dynamic; no static generation possible
- Server Actions are POST-only (no GET semantics for things like sharing URLs)
- A bug in `requireProfile()` would compromise all pages simultaneously

---

## ADR-005: Optimistic UI via React 19's `useOptimistic` hook

**Date:** Phase 5
**Status:** Accepted (partially implemented)

### Context

Clicking a task to complete it triggered a full server round-trip before the UI updated. Felt sluggish: about 300ms of "is something happening?" before the checkbox flipped.

### Decision

Use `useOptimistic` to update the UI immediately on click, then reconcile with the server response.

### Alternatives considered

1. **Manual local state synced from server.** What most pre-React-19 apps do. More code.
2. **Accept the latency.** Measured 300ms isn't fatal, but feels bad.
3. **Move the writes client-side via Supabase realtime.** Large refactor for limited gain.

### Rationale

`useOptimistic` is purpose-built for this. The pattern: define an optimistic state with a reducer, apply the predicted update before the action, render based on the optimistic state. When the server response comes back and triggers a re-render, the optimistic state automatically settles.

### Trade-offs accepted

- Only implemented for task completion in `DirectivesPanel`, not for chapter completion or reward redemption. Adding those would help but adds complexity.
- If the server returns an error, the optimistic update reverts. But the user already saw the UI change. This is mildly disorienting. Mitigated by surfacing errors in the telemetry strip.
- Optimistic UI is a *prediction*. If our prediction is wrong (e.g., the server has different state than we assumed), the snap-back is jarring.

---

## ADR-006: Row Level Security as defense-in-depth, not primary enforcement

**Date:** Pre-deploy
**Status:** Accepted

### Context

Supabase strongly recommends Row Level Security (RLS) policies on all tables. RLS enforces row-level access at the database level using the requesting JWT.

There are two ways to use RLS with Prisma:

1. **Primary enforcement.** Prisma connects as the authenticated user. RLS evaluates per-row. Application code doesn't need ownership checks.
2. **Defense-in-depth.** Prisma connects as admin (bypassing RLS). Application code does ownership checks. RLS is enabled but only enforces for non-Prisma access paths.

### Decision

Option 2: defense-in-depth.

### Alternatives considered

1. **No RLS at all.** Viable for our threat model (the DB isn't exposed publicly), but Supabase displays persistent warnings and there's no real cost to enabling it.
2. **Full RLS enforcement.** Would require a Prisma extension that injects auth context into every query, plus careful testing.

### Rationale

Our application-level checks (`requireProfile()` and per-action ownership verification) are sufficient for our threat model. RLS as a safety net protects against:

- Future code paths that might query Supabase via REST or Realtime instead of Prisma
- Bugs that might let an unscoped query through
- Audits that check "is RLS enabled" as a yes or no

Full RLS enforcement would add latency to every query and require significant testing. The marginal security benefit doesn't justify the cost at this stage.

### Trade-offs accepted

- If we ever connect Prisma differently (e.g., via Supabase's `pg` connection), our security would still depend on application checks
- The "defense-in-depth" claim is technically true but slightly weaker than full RLS
- We need to remember to add RLS policies whenever we add new tables

---

## ADR-007: Route groups for shared layout instead of duplicate layouts

**Date:** Phase 3
**Status:** Accepted

### Context

Authenticated pages all need the same chrome: sidebar and topbar. Initial implementation had `layout.tsx` files in five separate folders (`dashboard/`, `quests/`, `skills/`, `rewards/`, `profile/`). Identical code, five copies.

### Decision

Use a Next.js [route group](https://nextjs.org/docs/app/building-your-application/routing/route-groups) `(app)` containing all five pages with a single shared `layout.tsx`.

### Alternatives considered

1. **Keep duplicate layouts.** Works but DRY violation.
2. **Move chrome into root `layout.tsx`.** Would also wrap unauthenticated pages (landing, login).
3. **A `<Shell>` component imported by each page.** Works but adds boilerplate in every page.

### Rationale

Route groups are the idiomatic Next.js way to share layout across a subset of routes without affecting URLs. Files moved from `app/dashboard/page.tsx` to `app/(app)/dashboard/page.tsx`, URL stays `/dashboard`.

### Trade-offs accepted

- Slight conceptual overhead: "what does `(app)` mean?" needs explaining to new contributors
- One more directory level

---

## ADR-008: Custom CSS for HUD aesthetic instead of shadcn/ui or Radix

**Date:** Phase 1
**Status:** Accepted with caveats

### Context

Most modern Next.js projects use shadcn/ui (built on Radix) for primitives. Buttons, modals, dialogs, etc. come pre-built and accessible.

### Decision

Hand-write components for the HUD aesthetic. Use Lucide for icons only.

### Alternatives considered

1. **shadcn/ui.** Fast to ship, accessible by default, but defaults look like every other AI-built SaaS.
2. **Headless UI or Radix without shadcn.** Get the accessibility primitives, style from scratch.
3. **Full hand-roll** (chosen).

### Rationale

The cyberpunk HUD aesthetic is a primary differentiator. Off-the-shelf components carry strong visual defaults (rounded corners, soft shadows, soft colors) that fight against this aesthetic. Restyling them is more work than starting fresh.

### Trade-offs accepted

- **Accessibility is weaker than Radix-based components.** Our Modal lacks proper focus trap, no aria-labelledby connection, no inert backgrounds. This is a known gap.
- More code to maintain. Each primitive (Modal, Select, etc.) is our responsibility.
- Some bugs we'd never have written are now possible (e.g., scroll lock not perfect)

### Mitigation

For a future iteration, consider migrating modal/dialog logic to Radix while keeping the HUD styling.

---

## ADR-009: Zustand for ephemeral UI state, not Redux or Context

**Date:** Phase 5
**Status:** Accepted

### Context

The telemetry strip and celebration overlay need to be triggered from anywhere in the component tree. They don't fit React state (too deep to prop-drill).

### Decision

Use Zustand. One store per concern (`useTelemetry`, `useCelebration`).

### Alternatives considered

1. **React Context.** Sufficient, but every consumer re-renders on any state change.
2. **Redux Toolkit.** Heavy. Overkill for two stores with simple state.
3. **Jotai/Recoil.** Atomic state. Different mental model, not familiar to all contributors.

### Rationale

Zustand has a tiny API surface, no provider boilerplate, and selective subscriptions (components only re-render when their selected slice changes). For our two stores, it's the right size of tool.

### Trade-offs accepted

- Another dependency (~2KB gzipped)
- The store is module-global, which makes SSR a tiny bit trickier (mitigated by the stores only being consumed client-side)

---

## ADR-010: Total XP denormalized on Profile instead of computed

**Date:** Phase 3
**Status:** Accepted

### Context

A user's total XP is the sum of all task completion XP, minus all redemption XP. We could:

1. Compute this on every read: `SUM(xpAwarded) - SUM(xpSpent)`
2. Materialize it on the Profile row, update on every mutation

### Decision

Materialize.

### Alternatives considered

Computing on read is simpler. No risk of desync.

### Rationale

`totalXp` appears on every dashboard load, in the topbar, on the rewards page, on the profile page. That's 4 to 5 read sites per page navigation. Materializing avoids the aggregation cost (small now, but grows with completion history).

Mutations are rare relative to reads. Task completions are a few per day, vs. dozens of page reads.

### Trade-offs accepted

- **Risk of desync.** If a future bug forgets to update `totalXp` after creating a `TaskCompletion`, the cached value drifts from the event log.
- **Mitigation:** all writes go through 2-3 server actions which are easy to audit. Each one updates `totalXp` in the same transaction as the completion/redemption.
- **Recovery:** if desync happens, recomputing is a single query: `UPDATE profiles SET total_xp = (SELECT SUM(xp_awarded) FROM task_completions WHERE profile_id = profiles.id) - (SELECT SUM(xp_spent) FROM redemptions WHERE profile_id = profiles.id)`.

---

## ADR-011: No real-time sync; refresh required for cross-device updates

**Date:** Phase 4 planning
**Status:** Accepted

### Context

Supabase supports Postgres-backed real-time subscriptions out of the box. We could have the app listen for changes and update in real-time across devices.

### Decision

Don't.

### Alternatives considered

Implementing real-time would mean:
- Client-side Supabase queries (currently we only use Prisma server-side)
- Bypassing our gatekeeper pattern (RLS would become primary enforcement)
- WebSocket connections per user
- Conflict resolution if two devices edit simultaneously

### Rationale

For a personal life-tracking app, the primary use case is one person on one device at a time. Real-time would add significant complexity for marginal benefit.

### Trade-offs accepted

- If you complete a task on your phone, your desktop won't see it until refresh
- Future scope: if this becomes a real friction, real-time can be added incrementally for specific tables

---

## ADR-012: "Today" is UTC, not user timezone

**Date:** Phase 3
**Status:** Provisional, known limitation

### Context

Daily directives reset "tomorrow." Streaks count consecutive days. Both depend on the definition of "today."

### Decision

Use UTC for all date math.

### Alternatives considered

1. **User timezone stored on Profile.** Most correct, but requires a Profile column and timezone selector in onboarding.
2. **Browser timezone, passed to the server.** Possible but breaks server-side rendering (server doesn't know the browser tz).

### Rationale

Quick to ship. Works correctly for users in UTC-adjacent timezones.

### Trade-offs accepted

- **Users in distant timezones see weird behavior.** For a user in India (UTC+5:30), "today" rolls over at 5:30 AM local time, not midnight. A task completed at 1 AM local time counts toward the previous day.
- **Mitigation:** add `Profile.timezone` and adjust queries. Estimated effort: 2 to 3 hours. Not done yet because impact is small.

---

## Decisions intentionally deferred

These are choices we noticed needed making, but consciously decided to defer:

| Decision | Why deferred |
|----------|--------------|
| Achievement / badge system | Streak milestones cover the most-rewarding edge cases. Full badge taxonomy was out of scope for ship date. |
| Mobile app | PWA install works. Native app deferred until usage proves it matters. |
| Skill tree with sub-skills | The four flat vitals work for now. Sub-skill prerequisites were complex and unclear how to balance. |
| Email customization | Supabase's default emails work. Custom templates can be added without code changes via Supabase dashboard. |
| Analytics | No telemetry currently. If or when needed, we'd add Plausible or PostHog. |
| Data export | The Supabase API and `pg_dump` work as escape hatches. An in-app export would be polish. |

---

## What we'd do differently next time

Recorded for honesty:

- **Run `npm run build` from day one, not at deploy time.** TypeScript errors accumulated across phases because the dev server was lenient. Catching them earlier would have been cheaper than fixing in batch.
- **Set up Prisma migrations from the start.** We used `db push` for schema changes (fast for dev, lossy for history). A real migration log would matter once data is precious.
- **Decide on timezone handling before any date math.** UTC-as-default is a punt that creates real bugs.
- **Add a `users` table layer between Supabase auth and our Profile.** We tied Profile.id directly to the auth UUID, making the data model harder to port if we ever leave Supabase.
- **Consider Radix/Headless UI for primitives.** Hand-rolled modals look great but ship accessibility debt.

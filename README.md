# NIGHT//OS

> Turn your life into a system. Track quests, level up, earn rewards.

A gamified life-management application built on Next.js 15. NIGHT//OS reframes daily habits as "directives," long-term goals as "quest lines," and self-rewards as XP-gated unlocks, wrapped in a cyberpunk HUD aesthetic.

**Live demo:** [https://lifeproto.vercel.app](https://lifeproto.vercel.app)

---

## Screenshots

*Placeholder for screenshots:*
- Landing page with glitch animation
![alt text](image.png)
- Dashboard with stats and daily directives
![alt text](image-1.png)
- Quest log with chapter progression
![alt text](image-2.png)
- Onboarding tour

---

## What it does

NIGHT//OS turns the abstract idea of "self-improvement" into a measurable game:

- **Daily directives.** Recurring tasks tagged with a vital (Health, Mind, Discipline, Social). Complete them to earn XP and grow the relevant stat.
- **Quest lines.** Long-form objectives broken into chapters. Complete chapters individually; XP is awarded per chapter; the quest auto-completes when the last chapter is done.
- **Skill matrix.** Read-only view of your four vital stats and how they've moved over the last 30 days.
- **Reward cache.** Define rewards you actually enjoy (a gaming session, a movie night) and price them in XP. Earn XP through directives and quests, spend it on the things you love.
- **Streak tracking.** Consecutive-day discipline with combo multipliers and milestone celebrations (7, 14, 30, 60, 100 days).
- **Onboarding tour.** First-time users see a 6-step walkthrough explaining each module.

---

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | Next.js 15 (App Router) | Server Components for fast reads, Server Actions for type-safe writes |
| **Language** | TypeScript (strict mode) | Type safety across the full stack |
| **Database** | PostgreSQL (Supabase-hosted) | Mature, free tier, integrated auth |
| **ORM** | Prisma 6 | Type-safe queries generated from schema |
| **Auth** | Supabase Auth | Email/password, JWT sessions, mature primitives |
| **Styling** | Tailwind CSS v3 | Utility-first, custom HUD design tokens |
| **Animation** | Framer Motion | Declarative animations, used for HUD effects |
| **State** | Zustand | Lightweight global stores for telemetry and celebrations |
| **Icons** | Lucide React | Consistent line-icon library |
| **Hosting** | Vercel | Native Next.js hosting, edge functions, CDN |
| **Security** | Row Level Security (Postgres) | Defense-in-depth at the database layer |

---

## Architecture overview

```mermaid
flowchart LR
    User[User Browser]
    Vercel[Vercel Edge<br/>Next.js App]
    Supabase[Supabase<br/>Auth + Postgres]

    User -->|HTTPS| Vercel
    Vercel -->|Server Components<br/>Server Actions| Supabase
    Vercel -->|Auth session<br/>via cookies| User
```

The application is fundamentally a server-rendered Next.js app. Pages fetch data server-side via Prisma, render to HTML, and stream to the browser. Client-side hydration handles interactivity. Mutations go through Server Actions, which run on Vercel's serverless functions and write to Postgres via Prisma.

**See [ARCHITECTURE.md](./ARCHITECTURE.md) for the deep dive.**

---

## Getting started

### Prerequisites

- Node.js 20+ and npm
- A Supabase account (free tier works)
- Git

### Local setup

```bash
# 1. Clone the repo
git clone https://github.com/addydevx/lifeproto.git
cd lifeproto

# 2. Install dependencies
npm install

# 3. Copy the env template and fill it in
cp .env.example .env.local
# Edit .env.local with your Supabase credentials (see below)

# 4. Push the schema to your Supabase database
npm run db:push

# 5. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```ini
# Supabase project URL, found in Supabase dashboard at Settings, API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co

# Anon (public) key. Safe to expose; protected by RLS
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Pooled DB connection. Used by Prisma at runtime
DATABASE_URL="postgresql://postgres.YOUR_PROJECT:PASSWORD@aws-x-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=5"

# Direct DB connection. Used by Prisma for migrations
DIRECT_URL="postgresql://postgres.YOUR_PROJECT:PASSWORD@aws-x-region.pooler.supabase.com:5432/postgres"
```

### Available scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build (type-checks too)
npm run start            # Run production build locally
npm run lint             # ESLint
npm run db:push          # Sync Prisma schema to database
npm run db:studio        # Open Prisma Studio (visual DB editor)
npm run db:wipe-starters # Wipe seed data for a callsign
```

---

## Key engineering decisions

The full rationale is in [DECISIONS.md](./DECISIONS.md), but in brief:

1. **Server Components for reads, Server Actions for writes.** No client-side data fetching, no React Query. Pages are dynamic but cacheable per-request.
2. **Prisma over raw SQL or Drizzle.** Generated types catch entire classes of bugs at compile time.
3. **Supabase Auth + Prisma instead of Supabase client.** Auth handled by Supabase SSR helpers, but all data access goes through Prisma for type safety.
4. **Optimistic UI via React 19's `useOptimistic` hook.** Task toggles update instantly; the server confirms or rolls back.
5. **Row Level Security as a safety net.** Prisma uses an admin connection (bypassing RLS), but RLS is enabled to protect any future direct API access.
6. **Single shared layout for authenticated pages** via a route group `(app)`. Avoids duplicate sidebar/topbar code across five routes.

---

## What's intentionally not built

Being explicit about scope:

- **No mobile app.** The web app is responsive enough to install as a PWA, but there's no native iOS or Android client.
- **No real-time sync.** If you have the app open on two devices, changes on one don't push to the other. Refresh required.
- **No skill tree branching.** The Skill Matrix shows the four flat vitals; sub-skills with prerequisites were de-scoped.
- **No notifications or reminders.** This is a pull-based system, not a push-based one.
- **No data export.** Your data lives in Supabase. You can pull it out via the Supabase API or `pg_dump`, but there's no in-app export button.
- **No achievement system.** Streak milestones trigger celebration overlays, but there's no persistent badge or achievement log.

---

## Project structure

```
lifeproto/
├── prisma/
│   └── schema.prisma           # Database schema (single source of truth)
├── scripts/
│   └── wipe-starters.ts        # One-time cleanup script
├── src/
│   ├── actions/                # Server Actions (writes only)
│   │   ├── auth.ts             # Signup, login, logout
│   │   ├── tasks.ts            # Task CRUD + completion
│   │   ├── quests.ts           # Quest CRUD + chapter completion
│   │   ├── rewards.ts          # Reward CRUD + redemption
│   │   └── onboarding.ts       # Mark onboarding complete
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (login, signup)
│   │   ├── (app)/              # Authenticated routes (dashboard, quests, etc.)
│   │   ├── globals.css         # Global styles + HUD CSS
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── forms/              # Modal forms (Task, Quest, Reward)
│   │   ├── hud/                # HUD design system primitives
│   │   └── layout/             # Sidebar, TopBar
│   ├── lib/
│   │   ├── auth.ts             # requireProfile() gatekeeper
│   │   ├── db/                 # Prisma client + queries
│   │   ├── stores/             # Zustand stores
│   │   └── supabase/           # Supabase client variants
│   └── middleware.ts           # Auth middleware
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## License

Personal project. Not currently licensed for redistribution.

---

## Acknowledgments

Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com/), [Prisma](https://prisma.io/), and [Tailwind CSS](https://tailwindcss.com/). Cyberpunk aesthetic inspired by tactical interfaces in games and films.

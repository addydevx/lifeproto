# NIGHT//OS

A cyberpunk life-RPG: turn your daily tasks into directives, your goals into quests, and your stats into a system you can level up.

## Phase 1 — DONE

Project scaffold, full cyberpunk design system, all page routes, dashboard with mock data.

What's working:
- Landing page (`/`) with animated boot, glitch text, feature blocks
- Auth pages (`/login`, `/signup`) — UI only, not wired yet
- Dashboard (`/dashboard`) — XP gauge, streak combo, vital stats, daily directives, active quests, weekly telemetry chart
- Quests, Skills, Rewards, Profile pages — polished stubs ready for Phase 4 logic
- HUD design system: panels with corner brackets, scanline overlay, glitch text, animated stat bars, custom scrollbar, three fonts (Orbitron display, JetBrains Mono, Rajdhani body)

## Running it

```bash
cd lifeproto
npm install
npm run dev
```

Then open http://localhost:3000

## What's next

- **Phase 2** — Supabase auth + Prisma schema + database wiring. You'll need to create a free Supabase project and add keys to `.env.local`.
- **Phase 3** — Replace mock data with real DB reads via Server Components.
- **Phase 4** — Full skill tree, quest creation UI, reward redemption flow, achievement system.
- **Phase 5** — Server Actions for completing tasks, awarding XP, updating stats; real-time sync.

## Stack

- Next.js 15 (App Router) + React 19 RC
- TypeScript strict mode
- Tailwind CSS v4
- Framer Motion for HUD animations
- Lucide for icons
- (Phase 2) Supabase + Prisma + Postgres

## Design system tokens

Defined in `tailwind.config.ts`:
- `ink-*` — base canvas (deep slate, not black)
- `cyan` — primary HUD signal
- `magenta` — streak/critical accent
- `vital-{health|mind|discipline|social|quest}` — stat colors

Reusable HUD primitives in `src/components/hud/`:
- `HUDPanel` — labeled container with corner brackets + status indicator
- `XPGauge` — level + XP-to-next-level
- `StreakDisplay` — streak count + combo multiplier
- `StatBar` — animated vital bar per stat
- `TaskRow` — single directive with status/XP/vital gain
- `QuestCard` — quest line with chapter progress
- `GlitchText` — chromatic-aberration glitch animation
- `SystemClock` — live clock with HUD styling

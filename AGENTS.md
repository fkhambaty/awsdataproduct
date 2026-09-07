# FunBerry Kids — notes for an AI agent working in this repo

FunBerry Kids is an **educational games website (and Expo app)** for children roughly **ages 5–8**. It is **not** a marketplace, LMS, or homework grader. Parents create an account, add child profiles, and kids play short EVS (Environmental Studies) mini-games in themed “worlds.” Live site: <https://funberrykids.in>. Support: `hello@funberrykids.in`.

The brand name and tagline live in [`packages/config/src/brand.ts`](packages/config/src/brand.ts). Change them there, not in random screens.

## What this product is

- A **village of learning zones**: 15 ICSE Class 2 EVS themes plus a Computer Studies exam world.
- Two surfaces: **kid play** (`/play`) and **parent dashboard** (`/dashboard`).
- Progress = stars, best scores, coaching-style reports for parents.
- **Premium** unlocks most games; free accounts play a slice of each EVS world. **Computer Lab is fully free** (every folder and game).
- Optional **Learning Packs**: a parent photographs textbook pages, OCR + a **rules engine** (not an LLM) turn text into games. Read [`docs/LEARNING_PACKS.md`](docs/LEARNING_PACKS.md) before changing this pipeline.

## What this product is not

- Not Okavo / FORMA / a software marketplace. That repo is unrelated even if the same human owns it.
- Not a school SIS. No attendance, no teacher gradebook, no “AI tutor that chats with the child.”
- Not a claim that we copied any publisher’s textbook. Games are **theme-aligned**; see [`docs/SYLLABUS_ALIGNMENT.md`](docs/SYLLABUS_ALIGNMENT.md).
- Stripe / RevenueCat copy in `packages/config` is **placeholder**. **Live web payments are Razorpay INR** (₹99/week, ₹349/month).

## Who uses which UI

| Audience | Routes | Allowed to see |
|----------|--------|----------------|
| **Child** | `/play` | Worlds, games, stars, kid-facing copy. No billing, no email, no PIN digits in the game UI. |
| **Parent** | `/login`, `/signup`, `/dashboard`, `/dashboard/progress`, `/dashboard/packs`, `/pricing` | Children, reports, coupons, Razorpay upgrade, PIN lock / timer. |
| **Admin** | `/admin` | Allowlisted emails (`ADMIN_EMAILS`, default owner). Bearer session + service role APIs. |
| **Anonymous** | `/`, `/pricing`, `/privacy`, `/terms` | Marketing. Home is SSR; play/dashboard are client-heavy. |

Kid “Home” on `/play` stays inside the play SPA (worlds or child picker). The parent home is `/dashboard`. Do not send a child to the dashboard without a parent PIN gate.

## Layout

```
funberry/
├── apps/web/              # Next.js 15 — the website
├── apps/mobile/           # Expo — auth/home exist; in-app game player is still a placeholder
├── packages/config/       # Brand, zones, pricing (runtime source of truth for zone metadata)
├── packages/ui/           # Shared kid UI
├── packages/game-engine/  # Templates, EVS game data, lesson rules engine, Pixi labs
├── packages/supabase/     # Browser client, types, data hooks
└── supabase/migrations/   # Postgres, RLS, RPCs
```

**Runtime sources of truth (easy to get wrong):**

- Zones kids see come from `@funberry/config` (`packages/config/src/zones.ts`).
- Games kids play come from `@funberry/game-engine` (`packages/game-engine/src/games/evs/`).
- Supabase tables `zones` / `games` are seeded but **the play UI does not read them**. `getZones()` / `getGamesByZone()` in hooks are unused. Do not “fix” play by querying those tables unless you intentionally unify the two.

Game UIs load **on demand** via `loadGameTemplate()` so PixiJS is not in the play-shell bundle. Do not re-export every template from `packages/game-engine/src/index.ts`.

## Environments

| Environment | Notes |
|-------------|--------|
| **Production** | Supabase project ref `tkuakihsswzhrcrqcqel`. Site `funberrykids.in`. Treat as live families. |
| **Local web** | `npm run dev:web` → `http://localhost:3000`. Copy [`apps/web/.env.example`](apps/web/.env.example) to `apps/web/.env.local`. |
| **Local mobile** | `npm run dev:mobile`. Uses `EXPO_PUBLIC_SUPABASE_*`. |

Never commit `.env`, `.env.local`, or service-role keys. The browser client **must not** hardcode a fallback anon JWT; URL + anon key come from env.

API keys dashboard: <https://supabase.com/dashboard/project/tkuakihsswzhrcrqcqel/settings/api>

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Web client + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web client (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only (admin APIs, webhooks, coupons) |
| `RAZORPAY_*` | Subscription create + webhook |
| `ADMIN_EMAILS` | Comma-separated allowlist for `/admin` |

## Auth, PIN, and money

- Web session is **Supabase Auth in the browser** (localStorage). Route guards are client-side; RLS is the real permission layer.
- Parent **PIN** is stored on `parents.pin` and compared in the client for lock screen / parent gate. Do not print PINs in logs or kid UI. Hashing it is future work; do not “fix” by storing it in localStorage under a new name.
- **Stars:** `increment_stars` is SECURITY DEFINER and must only credit a child whose `parent_id = auth.uid()` (migration `019_…`). Never add a client-only star counter as source of truth.
- **Payments:** amounts and plan IDs live on the server / Razorpay plans. The browser must not tell the server “charge ₹X.” Webhook HMAC is required. Stripe webhook routes are stubs — do not market Stripe as live.
- **Coupons:** no client RLS policies; redeem only through the service-role API.

## Data you must not leak

- Other families’ children: leaderboard RPCs anonymize everyone except the caller’s kids. Do not add `SELECT` on `children` for “all authenticated users.”
- Child photos may still be **base64 in `children.photo_url`**. Do not dump those into public pages or logs. Prefer Storage URLs if you change this.
- Learning-pack uploads live in private Storage (`book-uploads`); path must stay scoped to `auth.uid()`.

## Ground rules (product honesty)

- **Do not invent social proof** (user counts, school logos, “used in N cities”) unless it is real and already on the site.
- **Do not claim a feature that is off.** Mobile games, Stripe, offline mode, and “AI that writes lessons” are not live product promises.
- **Do not expand Learning Packs before measuring their evidence gate.** Run the documented 10-page trust test first; automated OCR/game counts do not prove factual correctness.
- **Kid copy stays kind and simple.** Parent copy can be more precise. Never show developer jargon (RLS, JWT, RPC) on `/play`.
- **Prices** live in [`packages/config/src/pricing.ts`](packages/config/src/pricing.ts). Play-side free/premium split is also in `PlayContent` (`FREE_GAME_FRACTION`). If those disagree, fix both; do not hardcode rupees in a random button.
- Prefer **database + RLS** for anything a hostile parent account could abuse (stars, other kids’ rows, coupons).

## How to run and check work

```bash
npm install
npm run dev:web          # website
npm run typecheck        # all workspaces
npm run build --workspace=@funberry/web
```

Typecheck the web app with the workspace script (`tsc --noEmit` in `apps/web`). After UI changes, exercise the real flow in the browser: landing → signup/login → add child → `/play` → finish a game → parent dashboard/report. A single screenshot is not enough.

If you add a Postgres function or policy, add a migration under `supabase/migrations/` with the next number. Apply it on the hosted project or local `supabase` — shipping SQL in git without applying it does nothing.

## Common tasks (where to edit)

| Change | Place |
|--------|--------|
| Zone name, order, free vs locked | `packages/config/src/zones.ts` |
| New/edited EVS games | `packages/game-engine/src/games/evs/` |
| Computer exam sections and source coverage | `docs/COMPUTER_EXAM_WORLD.md` first |
| New game **type** / template | `packages/game-engine/src/templates/` **and** `loadGameTemplate.ts` |
| Learning Pack OCR, generation, review or evaluation | `docs/LEARNING_PACKS.md` first |
| Parent report logic | `packages/supabase/src/coachingReport.ts` |
| Data access | `packages/supabase/src/hooks.ts` |
| Marketing landing | `apps/web/app/HomeContent.tsx` |
| Play SPA | `apps/web/app/(play)/play/PlayContent.tsx` |

## Checking permissions

RLS is the contract. The UI hiding a button is not security. When testing access, compare:

1. What the signed-in parent can read with the **anon key + user JWT**.
2. What is actually in the table (service role / SQL editor).

If those differ, you have a leak or a broken query — fix the policy or the RPC, not only the React tree.

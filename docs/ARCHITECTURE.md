## Stack
Next.js 14 (App Router) + Supabase (Postgres) + Vercel. Canvas game in React. Tailwind UI. Malay copy throughout.

## Now vs later
- **Now:** game engine, session store, opt-in, coupon catalog, redemption
- **Later:** accounts/RLS, leaderboard, engagement tiering, personalised offers

## Key flow (slice → redeem)
1. `/` loads — canvas renders, coupon strip below (seed data)
2. 60s game; each slice adds grocery-specific points; bombs cost a life
3. Game over → score saved to `game_sessions` → eligible coupons shown
4. Opt-in form (nama + no telefon) → saved to `opt_ins`
5. Tap eligible coupon (`score ≥ points_required`) → `redemptions` row created → code revealed

## Nav shell
Single-screen tool — game canvas + post-game claim panel. No sidebar needed v1. Leaderboard page (later) gets the persistent sidebar shell.

## Layer plan
Data model + data-access layer first → game logic → UI screens → engagement intelligence on top. Core game + redemption works with AI switched off — pure threshold checks.

## Repo structure
```
lib/data/        # all DB reads/writes (sessions, optins, coupons, redemptions)
lib/game/        # canvas engine, grocery defs, scoring
lib/ai/          # engagement tagging, coupon recommendation (later)
app/components/  # game canvas, opt-in form, coupon card, redemption modal
__tests__/       # beside each module
```

## Module map (build order)
1. **Game Engine** — canvas slicing, points, game-over. Owns: grocery defs, score.
2. **Session Store** — `game_sessions` CRUD.
3. **Opt-In** — form, consent, validation. Owns: `opt_ins`.
4. **Coupon Catalog** — list/filter by score. Owns: `coupons` reads.
5. **Redemption** — enforce caps, create row, reveal code. Owns: `redemptions` + coupon count update.
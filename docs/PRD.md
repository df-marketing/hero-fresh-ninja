## Problem
Malay mothers (20–50) have no fun, low-friction way to engage with fresh-grocery brands and walk away with a tangible discount. Existing coupon channels are passive — no engagement, no reward loop.

## Target user
Malay mothers, aged 20–50, mobile-first. Plays in short bursts between tasks. Wants quick entertainment + a real coupon code.

## Core objects
- **Game session** — one play: score, groceries sliced, duration
- **Opt-in** — name + phone (+ optional email), consent timestamp
- **Coupon** — code, BM title, points required, redemption cap
- **Redemption** — links opt-in + session + coupon, stores redeemed code

## MVP (v1) checklist
- [ ] Canvas slicing game: groceries fly up, slice to score, 60s timer, 3 lives
- [ ] Real Malay produce (rambutan, manggis, durian, pisang, tomato, cili)
- [ ] Score persists to DB on game over
- [ ] Opt-in form (nama + no telefon) unlocks redemption
- [ ] Coupon catalog filtered by session score threshold
- [ ] Redeem coupon → reveal code, decrement availability
- [ ] All screens render with seed data, no login wall
- [ ] Malay UI copy throughout
- [ ] Empty / loading / error states for every surface

## Non-goals (v1)
Loyalty program, user accounts, login wall, multiplayer, push notifications, payment integration.

## Success scenario
A mother opens the URL (no login), slices groceries for 60 seconds, scores 550 points, enters her name + phone, sees the "RM10 Diskan Bakul Buah" coupon (requires 500 pts), taps redeem, and sees code `BUAH10`. Redemption is saved to DB. She can replay.
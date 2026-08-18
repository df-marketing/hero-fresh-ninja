## Sprint 1 — Game Engine + Session Store
- [ ] Canvas game: groceries fly up, slice on click/drag, 60s timer, 3 lives
- [ ] Grocery defs: rambutan(10pts), manggis(15), durian(25), pisang(5), tomato(5), cili(10), bomb/buah-busuk(-1 life)
- [ ] Score calc + game-over signal
- [ ] `lib/data/sessions.ts` — insert/fetch game_sessions
- [ ] Game over → POST score → result screen
- [ ] Seed 3 demo sessions
- **DoD:** Player completes a 60s game, score persists to DB, result screen shows score.

## Sprint 2 — Opt-In + Coupons + Redemption ← v1 FUNCTIONAL
- [ ] Opt-in form (nama + no telefon), validation, POST to opt_ins
- [ ] Coupon catalog: fetch active coupons, filter by session score
- [ ] Redemption: check eligibility, create row, increment redeemed_count, reveal code
- [ ] Post-game flow: score → opt-in → eligible coupons → redeem → code
- [ ] Seed 3 coupons + 1 demo redemption
- **DoD:** Success scenario works end-to-end — play, score 500+, opt in, redeem, see code.

## Sprint 3 — Polish + States + Tests
- [ ] Loading/empty/error/partial/ready states for every surface
- [ ] Malay UI copy throughout
- [ ] Responsive mobile-first canvas sizing
- [ ] Rate-limiting on opt-in + redemption
- [ ] Execute manual test plan
- **DoD:** All five states handled; test plan passes; no dead buttons.

## Sprint 4 — Lock It Down
- [ ] Supabase Auth (phone OTP / email)
- [ ] Replace permissive RLS with `auth.uid() = user_id`
- [ ] Opt-in + redemption scoped to logged-in user
- [ ] Audit log writes on redemption + opt-in
- **DoD:** Anonymous can still play (read); must auth to opt-in/redeem.

## Sprint 5 — Engagement Intelligence
- [ ] Auto-tag sessions (engagement_tier) on game_ended
- [ ] Coupon fit ranking on results screen
- [ ] Audit log + agent tool scaffolding
- **DoD:** Sessions auto-tagged; coupons ranked by fit; actions audited.

## Gantt
```
S1 ████  Game + sessions
S2 ████  Opt-in + coupons + redemption  ← v1 functional
S3 ████  Polish + states + tests
S4 ████  Lock it down
S5 ████  Engagement intelligence
```
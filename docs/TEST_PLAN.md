## v1 success scenario
1. Open app URL (no login) → game canvas loads, coupon strip visible
2. Tap to start → groceries fly up, slicing works, timer counts down from 60
3. Slice enough to score ≥ 500 → game-over screen shows score
4. Check Supabase: `game_sessions` has new row with correct score
5. Opt-in form appears → enter "Aisyah" + "0123456789" → submit
6. Coupon list filters to eligible (score ≥ points_required) → "RM10 Diskan Bakul Buah" visible
7. Tap "Redeem" → code `BUAH10` revealed on screen
8. Check: `redemptions` has new row, `coupons.redeemed_count` incremented

## Empty state
No coupons eligible (score < all thresholds) → "Main lagi untuk buka kupon!" + replay button.

## Error state
- DB write fails on score save → "Sambungan bermasalah, cuba lagi" + retry button
- Redemption on exhausted coupon → "Kupon ini telah habis" + button disabled

## Loading state
- Coupon list fetching → skeleton cards
- Opt-in submitting → spinner on button, button disabled

## Edge cases
- Score exactly equals threshold → coupon eligible
- Redeem same coupon twice in one session → blocked (one redemption per session per coupon)
- Timer hits 0 with 0 slices → score 0, "Cuba lagi!" empty state
- Rate-limit exceeded on opt-in → "Terlalu banyak cubaan, tunggu sebentar"
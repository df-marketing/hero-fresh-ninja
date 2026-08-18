## Secret handling
Supabase service key server-side only — never in client bundles. `NEXT_PUBLIC_SUPABASE_URL` + anon key in client (anon key is designed for client exposure, gated by RLS).

## Permission model (v1)
Permissive RLS — anonymous reads/writes work for demo. Lock-down sprint: `auth.uid() = user_id` on game_sessions, opt_ins, redemptions; coupons read-only public.

## Approved tools rule
Agent may only call named server functions (`tag_session`, `recommend_coupon`, etc.). No `run_any` / `send_any`. Each tool validates input, returns structured errors.

## Audit principle
Every meaningful action (redemption, opt-in, coupon issue) logged to `audit_logs` with actor, tool, target, risk level, timestamp.

## PII
Opt-in names/phones stored in Supabase only. Never logged to console. Never exposed to other users. Lock-down adds row-level isolation.

## Rate-limiting
Redemption endpoint: max 5/min per IP. Opt-in form: max 3/min per IP. Prevents coupon farming.

## Could NOT verify in v1
No pentest run. XSS surface is canvas-only (no user HTML rendered). CSRF mitigated by SameSite cookies at lock-down. State plainly in Sprint 3 review.
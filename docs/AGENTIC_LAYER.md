## Draftable (low risk — auto)
- `tag_session` — assign engagement_tier to a game session
- `validate_optin` — normalise phone format, flag invalid
- `recommend_coupon` — rank coupons by fit_score for a session

## Executable after approval (medium)
- `draft_coupon_message` — generate Malay promotional copy for a coupon (reviewed before display)

## Approval required (high)
- `issue_coupon_code` — create new coupon + code (changes redemption pool)
- `adjust_threshold` — change points_required on a coupon

## Human-only (critical)
- `delete_optin_data` — remove PII (name/phone/email)
- `disable_coupon` — revoke a live coupon with existing redemptions

## Named tools only
Each action maps to one named server function with a narrow contract. No raw execute. Structured errors: `{ retryable: bool, reason: string }`.

## Audit log fields
id, actor (`user|agent|system`), tool_name, target_type, target_id, detail (jsonb), risk_level, created_at.

## v1 vs later
- **v1:** no agentic actions — all logic synchronous rule-based. Audit table + tool scaffolding added in intelligence sprint.
- **Later:** auto-tagging runs on game_ended; coupon message drafting queued for review.
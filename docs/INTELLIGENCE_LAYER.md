## Messy inputs
Variable game scores, phone number formatting, inconsistent player names, play frequency patterns.

## Auto-structure (per session, added in intelligence sprint)
```json
{
  "session_id": "uuid",
  "engagement_tier": "engaged",
  "tier_source": "rule",
  "tier_confidence": 1.0,
  "tier_review_status": "unreviewed",
  "recommended_coupon_id": "uuid",
  "recommendation_reason": "score 550 qualifies for 500-pt coupon"
}
```

## Events to track
game_started, game_ended, opt_in_submitted, coupon_viewed, coupon_redeemed.

## Scoring rules (rule-based v1)
- engagement_tier: `casual` (score < 200), `engaged` (200–599), `power_player` (≥ 600)
- redemption_eligible: `session.score ≥ coupon.points_required AND coupon.redeemed_count < coupon.max_redemptions AND coupon.is_active`
- coupon_fit_score: `coupon.points_required / session.score` — closer to 1.0 = best motivator (player barely qualifies)

## What gets ranked
Coupons ranked by fit_score for the active session — highest motivator first.

## v1 vs later
- **v1:** rule-based tiering + eligibility + fit ranking, inline — no model call.
- **Later:** phone validation via model, personalised coupon copy in BM, churn prediction on repeat players, A/B threshold tuning.
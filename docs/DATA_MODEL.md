## game_sessions
- id: uuid (pk, default gen_random_uuid)
- user_id: uuid (nullable — for RLS at lock-down)
- player_name: text (nullable)
- score: int not null default 0
- groceries_sliced: int not null default 0
- duration_seconds: int not null default 60
- created_at: timestamptz not null default now()

## opt_ins
- id: uuid (pk)
- user_id: uuid (nullable)
- name: text not null
- phone: text not null
- email: text (nullable)
- consent_given: boolean not null default true
- created_at: timestamptz not null default now()

## coupons
- id: uuid (pk)
- user_id: uuid (nullable)
- code: text not null unique
- title_bm: text not null
- description_bm: text
- points_required: int not null
- max_redemptions: int not null default 100
- redeemed_count: int not null default 0
- is_active: boolean not null default true
- expires_at: timestamptz (nullable)
- created_at: timestamptz not null default now()

## redemptions
- id: uuid (pk)
- user_id: uuid (nullable)
- opt_in_id: uuid → opt_ins(id)
- coupon_id: uuid → coupons(id)
- session_id: uuid → game_sessions(id)
- points_spent: int not null
- redeemed_code: text not null
- created_at: timestamptz not null default now()

## audit_logs
- id: uuid (pk)
- user_id: uuid (nullable)
- actor: text (user | agent | system)
- tool_name: text
- target_type: text, target_id: uuid
- detail: jsonb
- risk_level: text default 'low'
- created_at: timestamptz not null default now()

**Relationships:** redemption → opt_in (N:1), → coupon (N:1), → game_session (N:1).
**RLS:** permissive v1 policies on all tables. Lock-down replaces with `auth.uid() = user_id`.
**AI fields:** none in v1. Engagement tier (later on game_sessions) will carry value + `source` + `confidence` + `review_status`.
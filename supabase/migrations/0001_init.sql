-- game_sessions
create table if not exists game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  player_name text,
  score int not null default 0,
  groceries_sliced int not null default 0,
  duration_seconds int not null default 60,
  created_at timestamptz not null default now()
);
alter table game_sessions enable row level security;
drop policy if exists "game_sessions_v1_read" on game_sessions;
create policy "game_sessions_v1_read" on game_sessions for select using (true);
drop policy if exists "game_sessions_v1_write" on game_sessions;
create policy "game_sessions_v1_write" on game_sessions for all using (true) with check (true);

-- opt_ins
create table if not exists opt_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  phone text not null,
  email text,
  consent_given boolean not null default true,
  created_at timestamptz not null default now()
);
alter table opt_ins enable row level security;
drop policy if exists "opt_ins_v1_read" on opt_ins;
create policy "opt_ins_v1_read" on opt_ins for select using (true);
drop policy if exists "opt_ins_v1_write" on opt_ins;
create policy "opt_ins_v1_write" on opt_ins for all using (true) with check (true);

-- coupons
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  code text not null unique,
  title_bm text not null,
  description_bm text,
  points_required int not null,
  max_redemptions int not null default 100,
  redeemed_count int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
alter table coupons enable row level security;
drop policy if exists "coupons_v1_read" on coupons;
create policy "coupons_v1_read" on coupons for select using (true);
drop policy if exists "coupons_v1_write" on coupons;
create policy "coupons_v1_write" on coupons for all using (true) with check (true);

-- redemptions
create table if not exists redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  opt_in_id uuid references opt_ins(id) on delete cascade,
  coupon_id uuid references coupons(id) on delete cascade,
  session_id uuid references game_sessions(id) on delete cascade,
  points_spent int not null,
  redeemed_code text not null,
  created_at timestamptz not null default now()
);
alter table redemptions enable row level security;
drop policy if exists "redemptions_v1_read" on redemptions;
create policy "redemptions_v1_read" on redemptions for select using (true);
drop policy if exists "redemptions_v1_write" on redemptions;
create policy "redemptions_v1_write" on redemptions for all using (true) with check (true);

-- audit_logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  actor text not null default 'system',
  tool_name text,
  target_type text,
  target_id uuid,
  detail jsonb,
  risk_level text default 'low',
  created_at timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

-- Seed coupons
insert into coupons (code, title_bm, description_bm, points_required, max_redemptions, redeemed_count, is_active) values
  ('SAYUR5', 'RM5 Diskan Sayur Segar', 'Dapatkan RM5 potongan untuk sayur segar', 300, 100, 12, true),
  ('BUAH10', 'RM10 Diskan Bakul Buah', 'Dapatkan RM10 potongan untuk bakul buah', 500, 50, 8, true),
  ('SEGAR15', 'RM15 Diskan Barangan Segar', 'Dapatkan RM15 potongan untuk barangan segar mingguan', 1000, 30, 3, true)
on conflict (code) do nothing;

-- Seed game sessions
insert into game_sessions (player_name, score, groceries_sliced, duration_seconds) values
  ('Aisyah', 680, 52, 60),
  ('Nurul', 420, 38, 60),
  ('Fatimah', 150, 14, 60)
on conflict do nothing;

-- Seed opt_ins
insert into opt_ins (name, phone, email, consent_given) values
  ('Aisyah', '0123456789', 'aisyah@email.com', true),
  ('Nurul', '0198765432', null, true)
on conflict do nothing;

-- Seed one redemption (Aisyah redeemed BUAH10 with her 680-pt session)
insert into redemptions (opt_in_id, coupon_id, session_id, points_spent, redeemed_code)
select oi.id, c.id, gs.id, 500, 'BUAH10'
from opt_ins oi
cross join coupons c
cross join game_sessions gs
where oi.name = 'Aisyah' and c.code = 'BUAH10' and gs.player_name = 'Aisyah' and gs.score = 680
and not exists (
  select 1 from redemptions r where r.redeemed_code = 'BUAH10' and r.opt_in_id = oi.id
)
limit 1;
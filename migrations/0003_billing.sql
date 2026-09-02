-- Membership, wallets, live gifts (50% DJ / 50% platform)

create table if not exists subscriptions (
  user_id text primary key,
  plan text not null,
  status text not null default 'active',
  amount_pence integer not null,
  started_at timestamptz not null default now(),
  renews_at timestamptz not null,
  cancelled_at timestamptz
);

create table if not exists wallets (
  user_id text primary key,
  available_pence integer not null default 0,
  lifetime_pence integer not null default 0
);

create table if not exists gifts (
  id text primary key,
  live_id text not null,
  from_user_id text not null,
  from_name text not null,
  to_user_id text,
  to_name text not null,
  sku text not null,
  label text not null,
  amount_pence integer not null,
  dj_share_pence integer not null,
  platform_share_pence integer not null,
  created_at timestamptz not null default now()
);
create index if not exists gifts_live_id_idx on gifts (live_id);
create index if not exists gifts_to_user_idx on gifts (to_user_id);
create index if not exists gifts_from_user_idx on gifts (from_user_id);

alter table booth_lives add column if not exists featured boolean not null default false;

-- Legal consents, invoices, payouts, UGC reports and blocks

create table if not exists consents (
  user_id text not null,
  kind text not null,
  version text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, kind)
);

create table if not exists invoices (
  id text primary key,
  user_id text not null,
  kind text not null,
  description text not null,
  amount_pence integer not null,
  vat_pence integer not null,
  net_pence integer not null,
  status text not null default 'paid',
  created_at timestamptz not null default now()
);
create index if not exists invoices_user_idx on invoices (user_id, created_at desc);

create table if not exists payouts (
  id text primary key,
  user_id text not null,
  amount_pence integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
create index if not exists payouts_user_idx on payouts (user_id, created_at desc);

create table if not exists reports (
  id text primary key,
  reporter_id text not null,
  target_type text not null,
  target_id text not null,
  reason text not null,
  details text not null default '',
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists reports_reporter_idx on reports (reporter_id, created_at desc);
create index if not exists reports_target_idx on reports (target_type, target_id);

create table if not exists blocks (
  user_id text not null,
  blocked_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, blocked_id)
);
create index if not exists blocks_user_idx on blocks (user_id);

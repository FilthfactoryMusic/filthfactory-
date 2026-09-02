-- Live signalling + audio relay so listeners actually receive the booth.

create table if not exists booth_viewers (
  live_id text not null references booth_lives(id) on delete cascade,
  viewer_id text not null,
  last_seen timestamptz not null default now(),
  primary key (live_id, viewer_id)
);
create index if not exists booth_viewers_seen_idx on booth_viewers (live_id, last_seen desc);

create table if not exists booth_signals (
  id text primary key,
  live_id text not null references booth_lives(id) on delete cascade,
  viewer_id text not null,
  from_role text not null,
  kind text not null,
  payload text not null,
  created_at timestamptz not null default now(),
  consumed boolean not null default false
);
create index if not exists booth_signals_pull_idx
  on booth_signals (live_id, viewer_id, from_role, consumed, created_at);

create table if not exists booth_chunks (
  id bigserial primary key,
  live_id text not null references booth_lives(id) on delete cascade,
  seq integer not null,
  mime text not null,
  data text not null,
  created_at timestamptz not null default now()
);
create index if not exists booth_chunks_live_seq_idx on booth_chunks (live_id, seq);

alter table booth_lives add column if not exists last_seen timestamptz not null default now();

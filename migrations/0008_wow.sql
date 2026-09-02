-- Daily Who's On What digest (UK underground roster).

create table if not exists wow_digest (
  day_id text primary key,
  payload text not null,
  scanned_at timestamptz not null default now()
);

-- Cached "just gone live" picks from YouTube / Mixcloud (links + thumbs only).

create table if not exists live_picks (
  id text primary key,
  payload text not null,
  scanned_at timestamptz not null default now()
);

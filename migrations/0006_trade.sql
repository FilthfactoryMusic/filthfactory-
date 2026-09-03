-- URL lives + the trade floor (gigs, looking, promoters, reviews)

alter table booth_lives add column if not exists watch_url text;
alter table booth_lives add column if not exists embed_url text;
alter table booth_lives add column if not exists source text not null default 'booth';

create table if not exists gigs (
  id text primary key,
  user_id text not null,
  display_name text not null,
  kind text not null,
  title text not null,
  city text not null default 'UK',
  when_text text not null default '',
  venue text not null default '',
  contact text not null default '',
  blurb text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists gigs_created_idx on gigs (created_at desc);

create table if not exists reviews (
  id text primary key,
  user_id text not null,
  display_name text not null,
  subject text not null,
  rating integer not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists reviews_created_idx on reviews (created_at desc);

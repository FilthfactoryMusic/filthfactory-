-- User booth lives and mix drops (per-user writes, world-readable lives)

create table if not exists booth_lives (
  id text primary key,
  user_id text not null,
  display_name text not null,
  photo text,
  title text not null,
  genre text not null,
  city text not null default 'UK',
  city_slug text not null default 'london',
  engine text not null,
  bpm integer not null default 132,
  seed integer not null,
  has_camera boolean not null default false,
  listeners integer not null default 1,
  started_at timestamptz not null default now()
);
create index if not exists booth_lives_user_id_idx on booth_lives (user_id);
create index if not exists booth_lives_started_idx on booth_lives (started_at desc);

create table if not exists booth_mixes (
  id text primary key,
  user_id text not null,
  display_name text not null,
  title text not null,
  genre text not null,
  city text not null,
  city_slug text not null,
  description text not null default '',
  engine text not null,
  bpm integer not null default 130,
  seed integer not null,
  duration integer not null default 3600,
  created_at timestamptz not null default now()
);
create index if not exists booth_mixes_user_id_idx on booth_mixes (user_id);

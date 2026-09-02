-- Weekly UKG / DnB chart lock. New snapshot at Friday 00:00 UK (end of Thursday).

create table if not exists chart_weeks (
  week_id text primary key,
  featured text not null,
  trending text not null,
  created_at timestamptz not null default now()
);

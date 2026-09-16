-- One 24/7 loop for the whole station (YouTube / Mixcloud / direct audio).

create table if not exists station_loop (
  id text primary key,
  url text not null default '',
  title text not null default 'Filthfactory 24/7',
  updated_at timestamptz not null default now()
);

insert into station_loop (id, title) values ('main', 'Filthfactory 24/7')
  on conflict (id) do nothing;

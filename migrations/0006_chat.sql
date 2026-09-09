-- Stream key so the phone can push audio even when cookies drop (Safari / PWA).
alter table booth_lives add column if not exists stream_key text;

create table if not exists booth_chat (
  id text primary key,
  live_id text not null,
  user_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists booth_chat_live_idx on booth_chat (live_id, created_at);

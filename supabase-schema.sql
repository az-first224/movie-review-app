create extension if not exists pgcrypto;

create table if not exists public.review_records (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  director text not null default '',
  tagline text not null default '',
  cast_names text not null default '',
  rating numeric(2, 1) not null default 0 check (rating >= 0 and rating <= 5),
  category text check (category in ('映画', '漫画', 'ドラマ', 'アニメ', 'ゲーム', 'スポーツ', '小説', '音楽')),
  genres text[] not null default '{}' check (
    genres <@ array[
      'ヒューマンドラマ',
      '恋愛',
      'コメディ',
      'ミステリー',
      'サスペンス',
      'ホラー',
      'SF',
      'ファンタジー',
      'アクション',
      'アドベンチャー',
      'ドキュメンタリー',
      '音楽',
      '日常',
      '青春'
    ]::text[]
  ),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_review_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists review_records_set_updated_at on public.review_records;
create trigger review_records_set_updated_at
before update on public.review_records
for each row
execute function public.set_review_records_updated_at();

alter table public.review_records enable row level security;

drop policy if exists "review_records_select_anon" on public.review_records;
create policy "review_records_select_anon"
on public.review_records
for select
to anon
using (true);

drop policy if exists "review_records_insert_anon" on public.review_records;
create policy "review_records_insert_anon"
on public.review_records
for insert
to anon
with check (true);

drop policy if exists "review_records_update_anon" on public.review_records;
create policy "review_records_update_anon"
on public.review_records
for update
to anon
using (true)
with check (true);

drop policy if exists "review_records_delete_anon" on public.review_records;
create policy "review_records_delete_anon"
on public.review_records
for delete
to anon
using (true);

insert into public.review_records
  (id, title, director, tagline, cast_names, rating, category, genres, comment)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '静かな軌道',
    '青井 真',
    '孤独な宇宙船で、記憶だけが灯りになる。',
    '水原 凛, 高瀬 航',
    5.0,
    '映画',
    array['SF'],
    '余白の多い演出と音の使い方が印象的。終盤の小さな表情の変化で物語全体が締まる。'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '路地裏の季節',
    '北村 遥',
    '変わらない街で、変わっていく人たち。',
    '佐伯 奈緒, 三浦 圭',
    4.0,
    'ドラマ',
    array['日常'],
    '会話劇として見やすく、登場人物の距離感が自然。派手さはないが、見終わったあとに残る。'
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'フレームの向こう側',
    '西園 透',
    '撮ることは、見つめ直すこと。',
    '語り: 西園 透',
    3.0,
    '映画',
    array['ドキュメンタリー'],
    '題材は面白い。中盤の構成が少し散らかるが、インタビューの熱量で最後まで見られる。'
  )
on conflict (id) do nothing;

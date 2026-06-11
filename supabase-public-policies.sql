-- Allow anyone using the public anon key to read and modify reviews.
-- Run this in the Supabase SQL Editor if owner-only policies were applied.

alter table public.review_records enable row level security;

drop policy if exists "review_records_select_anon" on public.review_records;
drop policy if exists "review_records_insert_anon" on public.review_records;
drop policy if exists "review_records_update_anon" on public.review_records;
drop policy if exists "review_records_delete_anon" on public.review_records;
drop policy if exists "review_records_select_public" on public.review_records;
drop policy if exists "review_records_insert_public" on public.review_records;
drop policy if exists "review_records_update_public" on public.review_records;
drop policy if exists "review_records_delete_public" on public.review_records;
drop policy if exists "review_records_insert_owner" on public.review_records;
drop policy if exists "review_records_update_owner" on public.review_records;
drop policy if exists "review_records_delete_owner" on public.review_records;

create policy "review_records_select_public"
on public.review_records
for select
to anon, authenticated
using (true);

create policy "review_records_insert_public"
on public.review_records
for insert
to anon, authenticated
with check (true);

create policy "review_records_update_public"
on public.review_records
for update
to anon, authenticated
using (true)
with check (true);

create policy "review_records_delete_public"
on public.review_records
for delete
to anon, authenticated
using (true);

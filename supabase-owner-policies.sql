-- Public readers can see reviews.
-- Only the specified Supabase Auth user can insert, update, and delete reviews.
--
-- Before running this SQL:
-- 1. Create your admin user in Supabase Authentication > Users.
-- 2. Copy that user's UUID.
-- 3. Replace OWNER_USER_ID_HERE below with the UUID.

alter table public.review_records enable row level security;

drop policy if exists "review_records_select_anon" on public.review_records;
drop policy if exists "review_records_insert_anon" on public.review_records;
drop policy if exists "review_records_update_anon" on public.review_records;
drop policy if exists "review_records_delete_anon" on public.review_records;
drop policy if exists "review_records_select_public" on public.review_records;
drop policy if exists "review_records_insert_owner" on public.review_records;
drop policy if exists "review_records_update_owner" on public.review_records;
drop policy if exists "review_records_delete_owner" on public.review_records;

create policy "review_records_select_public"
on public.review_records
for select
to anon, authenticated
using (true);

create policy "review_records_insert_owner"
on public.review_records
for insert
to authenticated
with check (auth.uid() = 'OWNER_USER_ID_HERE'::uuid);

create policy "review_records_update_owner"
on public.review_records
for update
to authenticated
using (auth.uid() = 'OWNER_USER_ID_HERE'::uuid)
with check (auth.uid() = 'OWNER_USER_ID_HERE'::uuid);

create policy "review_records_delete_owner"
on public.review_records
for delete
to authenticated
using (auth.uid() = 'OWNER_USER_ID_HERE'::uuid);

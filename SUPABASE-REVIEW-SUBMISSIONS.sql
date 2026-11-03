-- Client review submissions, moderation, and review card titles.
-- Safe to run after the existing portfolio schema. Existing reviews remain approved.
begin;

alter table public.reviews
  add column if not exists title text,
  add column if not exists status text not null default 'approved';

update public.reviews
set status = case when published then 'approved' else 'pending' end;

alter table public.reviews
  alter column status set default 'approved';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reviews_status_check'
      and conrelid = 'public.reviews'::regclass
  ) then
    alter table public.reviews
      add constraint reviews_status_check check (status in ('pending', 'approved'));
  end if;
end $$;

create index if not exists reviews_public_order_idx
  on public.reviews (sort_order, created_at desc)
  where published = true and status = 'approved';

create index if not exists reviews_pending_created_idx
  on public.reviews (created_at desc)
  where status = 'pending';

alter table public.reviews enable row level security;

drop policy if exists "public read reviews" on public.reviews;
drop policy if exists "admin write reviews" on public.reviews;
drop policy if exists "public submit review" on public.reviews;

create policy "public read approved reviews"
  on public.reviews for select
  using (status = 'approved' and published = true);

create policy "public submit review"
  on public.reviews for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and published = false
    and title is null
    and length(trim(name)) between 1 and 100
    and length(trim(review)) between 10 and 2000
    and rating between 1 and 5
    and coalesce(length(role), 0) <= 100
    and coalesce(length(company), 0) <= 120
    and (photo = '' or photo like '%/storage/v1/object/public/review-avatars/review-submissions/%')
  );

create policy "admin write reviews"
  on public.reviews for all
  using (public.is_admin())
  with check (public.is_admin());

-- Isolated public avatar bucket: Storage enforces the 3 MB and MIME limits.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-avatars', 'review-avatars', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "public read review avatars" on storage.objects;
create policy "public read review avatars"
  on storage.objects for select
  using (bucket_id = 'review-avatars');

drop policy if exists "public upload review avatars" on storage.objects;
create policy "public upload review avatars"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'review-avatars'
    and (storage.foldername(name))[1] = 'review-submissions'
    and lower(storage.filename(name)) ~ '\\.(jpg|jpeg|png|webp)$'
  );

drop policy if exists "admin delete review avatars" on storage.objects;
create policy "admin delete review avatars"
  on storage.objects for delete
  using (bucket_id = 'review-avatars' and public.is_admin());
notify pgrst, 'reload schema';
commit;

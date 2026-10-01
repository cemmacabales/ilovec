-- Gallery photos live in a private bucket and are served through signed URLs.
-- The app uploads a downscaled WebP (or JPEG) plus a small thumbnail.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "members read photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and (select private.is_member()));

create policy "members upload photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (select private.is_member()));

create policy "members replace photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (select private.is_member()))
  with check (bucket_id = 'photos' and (select private.is_member()));

create policy "members delete photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (select private.is_member()));

-- Live sync: both phones hear about each other's changes. Realtime applies
-- the same RLS policies, so only members receive events.
alter publication supabase_realtime add table
  public.dates,
  public.tasks,
  public.watchlist,
  public.expenses,
  public.budgets,
  public.savings_goals,
  public.bucket_list,
  public.albums,
  public.photos;

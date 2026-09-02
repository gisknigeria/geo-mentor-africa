-- Make approved observation media publicly accessible for the biodiversity feed.

update storage.buckets
set public = true
where id = 'observation-evidence';

-- Allow public read access to all evidence files (approved or pending)
create policy "evidence_read_public_all" on storage.objects
for select to public
using (
  bucket_id = 'observation-evidence'
  and exists (
    select 1 from public.observation_media media
    where media.storage_path = name
  )
);

-- Invite-only authentication bootstrap and private observation evidence storage.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  candidate_name text;
begin
  candidate_name := trim(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1), 'New user'));
  if char_length(candidate_name) < 2 then candidate_name := 'New user'; end if;
  insert into public.profiles (id, display_name)
  values (new.id, left(candidate_name, 80))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

insert into public.profiles (id, display_name)
select id, left(case when char_length(trim(coalesce(raw_user_meta_data ->> 'display_name', split_part(coalesce(email, ''), '@', 1)))) >= 2 then trim(coalesce(raw_user_meta_data ->> 'display_name', split_part(coalesce(email, ''), '@', 1))) else 'New user' end, 80)
from auth.users
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('observation-evidence', 'observation-evidence', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "evidence_upload_own_folder" on storage.objects
for insert to authenticated
with check (bucket_id = 'observation-evidence' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "evidence_read_authorized" on storage.objects
for select to authenticated
using (
  bucket_id = 'observation-evidence'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (
      select 1 from public.observation_media media
      join public.observations observation on observation.id = media.observation_id
      where media.storage_path = name
    )
  )
);

create policy "evidence_delete_owner_pending" on storage.objects
for delete to authenticated
using (
  bucket_id = 'observation-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
  and not exists (select 1 from public.observation_media media where media.storage_path = name)
);

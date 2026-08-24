-- Reviewed registration applications and supervised student class-code joining.
-- No application or join request grants trusted access automatically.

create table public.registration_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references public.profiles(id) on delete cascade,
  application_type text not null check (application_type in ('SCHOOL', 'MENTOR', 'EXPERT')),
  organization_name text check (organization_name is null or char_length(organization_name) between 2 and 180),
  country_code char(2) not null default 'NG',
  state_region text not null check (char_length(state_region) between 2 and 120),
  city text not null check (char_length(city) between 2 and 120),
  phone text check (phone is null or char_length(phone) <= 30),
  website text check (website is null or char_length(website) <= 300),
  credentials_summary text check (credentials_summary is null or char_length(credentials_summary) between 30 and 2000),
  motivation text not null check (char_length(motivation) between 30 and 1500),
  status public.verification_status not null default 'PENDING',
  reviewed_by uuid references public.profiles(id),
  review_notes text check (review_notes is null or char_length(review_notes) <= 1500),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((application_type = 'SCHOOL' and organization_name is not null) or application_type <> 'SCHOOL'),
  check ((application_type in ('MENTOR', 'EXPERT') and credentials_summary is not null) or application_type = 'SCHOOL')
);
create unique index registration_one_pending_type_idx on public.registration_applications(applicant_user_id, application_type) where status = 'PENDING';
create index registration_status_created_idx on public.registration_applications(status, created_at);

create table public.class_join_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  code_hash text not null unique check (char_length(code_hash) = 64),
  code_hint text not null check (char_length(code_hint) between 2 and 8),
  label text not null check (char_length(label) between 2 and 80),
  created_by uuid not null references public.profiles(id),
  expires_at timestamptz not null,
  max_uses integer not null default 40 check (max_uses between 1 and 500),
  use_count integer not null default 0 check (use_count between 0 and max_uses),
  active boolean not null default true,
  consent_version text not null default 'pilot-v1',
  created_at timestamptz not null default now()
);
create index class_join_codes_school_idx on public.class_join_codes(school_id, active, expires_at);

create table public.student_join_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  join_code_id uuid not null references public.class_join_codes(id) on delete restrict,
  student_display_name text not null check (char_length(student_display_name) between 2 and 80),
  guardian_name text not null check (char_length(guardian_name) between 2 and 120),
  guardian_email text not null check (char_length(guardian_email) between 5 and 254),
  consent_status public.verification_status not null default 'PENDING',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_notes text check (review_notes is null or char_length(review_notes) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (school_id, student_id)
);
create index student_join_requests_school_status_idx on public.student_join_requests(school_id, consent_status, created_at);

alter table public.registration_applications enable row level security;
alter table public.class_join_codes enable row level security;
alter table public.student_join_requests enable row level security;

create policy registration_read_own_or_admin on public.registration_applications
for select to authenticated
using (applicant_user_id = auth.uid() or private.is_platform_admin());

create policy registration_insert_own on public.registration_applications
for insert to authenticated
with check (applicant_user_id = auth.uid() and status = 'PENDING' and reviewed_by is null and reviewed_at is null);

create policy registration_update_pending_own on public.registration_applications
for update to authenticated
using (applicant_user_id = auth.uid() and status = 'PENDING')
with check (applicant_user_id = auth.uid() and status = 'PENDING' and reviewed_by is null and reviewed_at is null);

create policy registration_review_admin on public.registration_applications
for update to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin());

create policy class_codes_school_staff_read on public.class_join_codes
for select to authenticated
using (private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER']::public.app_role[]) or private.is_platform_admin());

create policy class_codes_school_admin_manage on public.class_join_codes
for all to authenticated
using (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin())
with check (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin());

create policy student_join_read on public.student_join_requests
for select to authenticated
using (student_id = auth.uid() or private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER']::public.app_role[]) or private.is_platform_admin());

create policy student_join_review on public.student_join_requests
for update to authenticated
using (private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER']::public.app_role[]) or private.is_platform_admin())
with check (private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER']::public.app_role[]) or private.is_platform_admin());

grant select, insert, update on public.registration_applications to authenticated;
grant select, update, delete on public.class_join_codes to authenticated;
grant select, update on public.student_join_requests to authenticated;

create or replace function public.join_school_with_code(
  join_code text,
  student_name text,
  guardian_name text,
  guardian_email text
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  selected_code public.class_join_codes%rowtype;
  normalized_code text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(student_name)) not between 2 and 80 then raise exception 'Invalid student name'; end if;
  if char_length(trim(guardian_name)) not between 2 and 120 then raise exception 'Invalid guardian name'; end if;
  if char_length(trim(guardian_email)) not between 5 and 254 or lower(trim(guardian_email)) !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then raise exception 'Invalid guardian email'; end if;

  normalized_code := upper(regexp_replace(trim(join_code), '[^A-Za-z0-9]', '', 'g'));
  select * into selected_code
  from public.class_join_codes
  where code_hash = pg_catalog.encode(extensions.digest(pg_catalog.convert_to(normalized_code, 'UTF8'), 'sha256'), 'hex')
    and active = true
    and expires_at > now()
    and use_count < max_uses
  for update;

  if selected_code.id is null then raise exception 'Invalid or expired class code'; end if;
  if exists (select 1 from public.organization_memberships where user_id = auth.uid() and role <> 'STUDENT') then
    raise exception 'This account already has a staff or trusted role';
  end if;

  if exists (select 1 from public.student_join_requests where school_id = selected_code.school_id and student_id = auth.uid()) then
    update public.student_join_requests set
      join_code_id = selected_code.id,
      student_display_name = trim(student_name),
      guardian_name = trim(guardian_name),
      guardian_email = lower(trim(guardian_email)),
      consent_status = 'PENDING',
      reviewed_by = null,
      reviewed_at = null,
      updated_at = now()
    where school_id = selected_code.school_id and student_id = auth.uid();
  else
    insert into public.student_join_requests (
      organization_id, school_id, student_id, join_code_id, student_display_name, guardian_name, guardian_email
    ) values (
      selected_code.organization_id, selected_code.school_id, auth.uid(), selected_code.id, trim(student_name), trim(guardian_name), lower(trim(guardian_email))
    );
    update public.class_join_codes set use_count = use_count + 1 where id = selected_code.id;
  end if;

  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (selected_code.organization_id, auth.uid(), 'STUDENT', 'PENDING')
  on conflict (organization_id, user_id, role) do nothing;

  update public.profiles set display_name = trim(student_name), updated_at = now() where id = auth.uid();
  return jsonb_build_object('status', 'PENDING', 'school_id', selected_code.school_id);
end;
$$;

revoke all on function public.join_school_with_code(text, text, text, text) from public;
grant execute on function public.join_school_with_code(text, text, text, text) to authenticated;

create or replace function public.create_class_join_code(
  target_school uuid,
  plain_code text,
  code_label text,
  valid_until timestamptz,
  allowed_uses integer default 40
)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  target_org uuid;
  normalized_code text;
  created_id uuid;
begin
  select organization_id into target_org from public.schools where id = target_school;
  if target_org is null or not private.has_org_role(target_org, array['SCHOOL_ADMIN']::public.app_role[]) then raise exception 'School administrator role required'; end if;
  normalized_code := upper(regexp_replace(trim(plain_code), '[^A-Za-z0-9]', '', 'g'));
  if char_length(normalized_code) < 8 then raise exception 'Class code must contain at least 8 letters or numbers'; end if;
  if valid_until <= now() or valid_until > now() + interval '180 days' then raise exception 'Invalid expiry date'; end if;
  if allowed_uses not between 1 and 500 then raise exception 'Invalid use limit'; end if;

  insert into public.class_join_codes (organization_id, school_id, code_hash, code_hint, label, created_by, expires_at, max_uses)
  values (target_org, target_school, pg_catalog.encode(extensions.digest(pg_catalog.convert_to(normalized_code, 'UTF8'), 'sha256'), 'hex'), right(normalized_code, 4), trim(code_label), auth.uid(), valid_until, allowed_uses)
  returning id into created_id;
  return created_id;
end;
$$;

revoke all on function public.create_class_join_code(uuid, text, text, timestamptz, integer) from public;
grant execute on function public.create_class_join_code(uuid, text, text, timestamptz, integer) to authenticated;

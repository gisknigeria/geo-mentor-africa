-- Administrative review, consent approval, class-code management and staff invitations.

insert into public.organizations (id, name, organization_type, country_code)
values ('00000000-0000-4000-8000-000000000001', 'GeoMentor Africa Network', 'NGO', 'NG')
on conflict (id) do nothing;

create table public.staff_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  email text not null check (char_length(email) between 5 and 254),
  role public.app_role not null check (role in ('SCHOOL_ADMIN', 'TEACHER')),
  token_hash text not null unique check (char_length(token_hash) = 64),
  token_hint text not null check (char_length(token_hint) between 2 and 8),
  status public.verification_status not null default 'PENDING',
  created_by uuid not null references public.profiles(id),
  expires_at timestamptz not null,
  accepted_by uuid references public.profiles(id),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index staff_invitations_school_status_idx on public.staff_invitations(school_id, status, expires_at);

alter table public.staff_invitations enable row level security;

create policy staff_invites_school_admin_read on public.staff_invitations
for select to authenticated
using (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin());

create policy staff_invites_school_admin_update on public.staff_invitations
for update to authenticated
using (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin())
with check (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin());

grant select, update on public.staff_invitations to authenticated;

create or replace function public.review_registration_application(
  application_id uuid,
  review_decision public.verification_status,
  notes text default null
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  application public.registration_applications%rowtype;
  created_org uuid;
  created_school uuid;
  assigned_role public.app_role;
begin
  if not private.is_platform_admin() then raise exception 'Platform administrator role required'; end if;
  if review_decision not in ('VERIFIED', 'REJECTED', 'NEEDS_CHANGES') then raise exception 'Invalid review decision'; end if;

  select * into application from public.registration_applications where id = application_id and status = 'PENDING' for update;
  if application.id is null then raise exception 'Pending application not found'; end if;

  if review_decision = 'VERIFIED' then
    if application.application_type = 'SCHOOL' then
      insert into public.organizations (name, organization_type, country_code)
      values (application.organization_name, 'SCHOOL', application.country_code)
      returning id into created_org;

      insert into public.schools (organization_id, name, country_code, state_region, city, verification_status, created_by)
      values (created_org, application.organization_name, application.country_code, application.state_region, application.city, 'VERIFIED', application.applicant_user_id)
      returning id into created_school;

      insert into public.organization_memberships (organization_id, user_id, role, status, invited_by)
      values (created_org, application.applicant_user_id, 'SCHOOL_ADMIN', 'VERIFIED', auth.uid());
    else
      created_org := '00000000-0000-4000-8000-000000000001';
      assigned_role := case when application.application_type = 'MENTOR' then 'MENTOR'::public.app_role else 'EXPERT'::public.app_role end;
      insert into public.organization_memberships (organization_id, user_id, role, status, invited_by)
      values (created_org, application.applicant_user_id, assigned_role, 'VERIFIED', auth.uid())
      on conflict (organization_id, user_id, role) do update set status = 'VERIFIED', invited_by = auth.uid();
    end if;
  end if;

  update public.registration_applications set status = review_decision, reviewed_by = auth.uid(), review_notes = nullif(trim(notes), ''), reviewed_at = now(), updated_at = now()
  where id = application.id;

  insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), created_org, 'REGISTRATION_' || review_decision::text, 'registration_application', application.id, jsonb_build_object('application_type', application.application_type));

  return jsonb_build_object('status', review_decision, 'organization_id', created_org, 'school_id', created_school);
end;
$$;
revoke all on function public.review_registration_application(uuid, public.verification_status, text) from public;
grant execute on function public.review_registration_application(uuid, public.verification_status, text) to authenticated;

create or replace function public.review_student_join_request(
  request_id uuid,
  review_decision public.verification_status,
  consent_confirmed boolean default false,
  consent_method text default 'DIGITAL',
  notes text default null
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  request public.student_join_requests%rowtype;
  consent_version text;
begin
  select * into request from public.student_join_requests where id = request_id and consent_status = 'PENDING' for update;
  if request.id is null then raise exception 'Pending student request not found'; end if;
  if not (private.has_org_role(request.organization_id, array['SCHOOL_ADMIN','TEACHER']::public.app_role[]) or private.is_platform_admin()) then raise exception 'School staff role required'; end if;
  if review_decision not in ('VERIFIED', 'REJECTED', 'NEEDS_CHANGES') then raise exception 'Invalid review decision'; end if;

  if review_decision = 'VERIFIED' then
    if not consent_confirmed then raise exception 'Verified guardian or school consent is required'; end if;
    if consent_method not in ('PAPER', 'DIGITAL', 'SCHOOL_AUTHORITY') then raise exception 'Invalid consent method'; end if;
    select code.consent_version into consent_version from public.class_join_codes code where code.id = request.join_code_id;
    insert into public.guardian_consents (organization_id, student_id, consent_version, consent_method, recorded_by, granted_at)
    values (request.organization_id, request.student_id, consent_version, consent_method, auth.uid(), now());
    update public.organization_memberships set status = 'VERIFIED'
    where organization_id = request.organization_id and user_id = request.student_id and role = 'STUDENT';
  elsif review_decision = 'REJECTED' then
    update public.organization_memberships set status = 'REJECTED'
    where organization_id = request.organization_id and user_id = request.student_id and role = 'STUDENT' and status = 'PENDING';
  end if;

  update public.student_join_requests set consent_status = review_decision, reviewed_by = auth.uid(), reviewed_at = now(), review_notes = nullif(trim(notes), ''), updated_at = now()
  where id = request.id;
  insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id)
  values (auth.uid(), request.organization_id, 'STUDENT_JOIN_' || review_decision::text, 'student_join_request', request.id);
  return jsonb_build_object('status', review_decision, 'student_id', request.student_id);
end;
$$;
revoke all on function public.review_student_join_request(uuid, public.verification_status, boolean, text, text) from public;
grant execute on function public.review_student_join_request(uuid, public.verification_status, boolean, text, text) to authenticated;

create or replace function public.create_staff_invitation(
  target_school uuid,
  invite_email text,
  invite_role public.app_role,
  plain_token text,
  valid_until timestamptz
)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  target_org uuid;
  normalized_token text;
  invitation_id uuid;
begin
  select organization_id into target_org from public.schools where id = target_school;
  if target_org is null or not (private.has_org_role(target_org, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin()) then raise exception 'School administrator role required'; end if;
  if invite_role not in ('SCHOOL_ADMIN', 'TEACHER') then raise exception 'Invalid staff role'; end if;
  if lower(trim(invite_email)) !~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then raise exception 'Invalid invitation email'; end if;
  if valid_until <= now() or valid_until > now() + interval '30 days' then raise exception 'Invalid expiry date'; end if;
  normalized_token := regexp_replace(trim(plain_token), '[^A-Za-z0-9]', '', 'g');
  if char_length(normalized_token) < 24 then raise exception 'Invitation token is too short'; end if;

  insert into public.staff_invitations (organization_id, school_id, email, role, token_hash, token_hint, created_by, expires_at)
  values (target_org, target_school, lower(trim(invite_email)), invite_role, pg_catalog.encode(extensions.digest(pg_catalog.convert_to(normalized_token, 'UTF8'), 'sha256'), 'hex'), right(normalized_token, 6), auth.uid(), valid_until)
  returning id into invitation_id;
  return invitation_id;
end;
$$;
revoke all on function public.create_staff_invitation(uuid, text, public.app_role, text, timestamptz) from public;
grant execute on function public.create_staff_invitation(uuid, text, public.app_role, text, timestamptz) to authenticated;

create or replace function public.accept_staff_invitation(invite_token text)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  invitation public.staff_invitations%rowtype;
  normalized_token text;
  signed_in_email text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  signed_in_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  normalized_token := regexp_replace(trim(invite_token), '[^A-Za-z0-9]', '', 'g');
  select * into invitation from public.staff_invitations
  where token_hash = pg_catalog.encode(extensions.digest(pg_catalog.convert_to(normalized_token, 'UTF8'), 'sha256'), 'hex')
    and status = 'PENDING' and revoked_at is null and expires_at > now()
  for update;
  if invitation.id is null then raise exception 'Invalid or expired staff invitation'; end if;
  if signed_in_email <> invitation.email then raise exception 'This invitation belongs to a different verified email'; end if;

  insert into public.organization_memberships (organization_id, user_id, role, status, invited_by)
  values (invitation.organization_id, auth.uid(), invitation.role, 'VERIFIED', invitation.created_by)
  on conflict (organization_id, user_id, role) do update set status = 'VERIFIED', invited_by = invitation.created_by;
  update public.staff_invitations set status = 'VERIFIED', accepted_by = auth.uid(), accepted_at = now() where id = invitation.id;
  insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id)
  values (auth.uid(), invitation.organization_id, 'STAFF_INVITATION_ACCEPTED', 'staff_invitation', invitation.id);
  return jsonb_build_object('status', 'VERIFIED', 'role', invitation.role, 'school_id', invitation.school_id);
end;
$$;
revoke all on function public.accept_staff_invitation(text) from public;
grant execute on function public.accept_staff_invitation(text) to authenticated;

create or replace function public.bootstrap_platform_admin(admin_email text)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  admin_id uuid;
begin
  select id into admin_id from auth.users where lower(email) = lower(trim(admin_email));
  if admin_id is null then raise exception 'Create and verify this Supabase Auth user first'; end if;
  insert into public.profiles (id, display_name)
  select id, left(coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), split_part(email, '@', 1)), 80) from auth.users where id = admin_id
  on conflict (id) do nothing;
  insert into public.organization_memberships (organization_id, user_id, role, status)
  values ('00000000-0000-4000-8000-000000000001', admin_id, 'PLATFORM_ADMIN', 'VERIFIED')
  on conflict (organization_id, user_id, role) do update set status = 'VERIFIED';
  return admin_id;
end;
$$;
revoke all on function public.bootstrap_platform_admin(text) from public, anon, authenticated;

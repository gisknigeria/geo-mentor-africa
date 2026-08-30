-- Real, source-attributed school catalogue and privacy-safe public map summaries.
-- Catalogue rows are imported from licensed/open datasets such as Overture Maps
-- or reviewed programme datasets. They are discovery records, not verified members.

create table if not exists public.school_catalog (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('OVERTURE', 'OPENSTREETMAP', 'GOVERNMENT', 'PROGRAMME_IMPORT')),
  source_id text not null,
  name text not null check (char_length(name) between 2 and 220),
  school_type text,
  country_code char(2) not null,
  state_region text,
  district_lga text,
  city text,
  location geometry(Point, 4326) not null,
  confidence numeric(5,4) check (confidence is null or confidence between 0 and 1),
  source_updated_at timestamptz,
  imported_at timestamptz not null default now(),
  unique (source, source_id)
);
create index if not exists school_catalog_location_gix on public.school_catalog using gist(location);
create index if not exists school_catalog_country_state_idx on public.school_catalog(country_code, state_region);
create index if not exists school_catalog_name_search_idx on public.school_catalog(lower(name) text_pattern_ops);
alter table public.school_catalog enable row level security;
revoke all on public.school_catalog from anon, authenticated;

alter table public.schools add column if not exists catalog_source text;
alter table public.schools add column if not exists catalog_external_id text;
create unique index if not exists schools_catalog_identity_idx on public.schools(catalog_source, catalog_external_id)
where catalog_source is not null and catalog_external_id is not null;

alter table public.registration_applications add column if not exists catalog_source text;
alter table public.registration_applications add column if not exists catalog_external_id text;
alter table public.registration_applications add column if not exists proposed_latitude numeric(10,7)
  check (proposed_latitude is null or proposed_latitude between -90 and 90);
alter table public.registration_applications add column if not exists proposed_longitude numeric(10,7)
  check (proposed_longitude is null or proposed_longitude between -180 and 180);
alter table public.registration_applications add constraint registration_school_location_pair
  check ((proposed_latitude is null) = (proposed_longitude is null));

create or replace function public.public_home_impact()
returns jsonb
language sql
stable
security definer set search_path = ''
as $$
  select jsonb_build_object(
    'schools', (select count(*) from public.schools where verification_status = 'VERIFIED'),
    'countries', (select count(distinct country_code) from public.schools where verification_status = 'VERIFIED'),
    'observations', (select count(*) from public.observations),
    'media_uploads', (select count(*) from public.observation_media),
    'verified_observations', (select count(*) from public.observations where verification_status = 'VERIFIED'),
    'awaiting_review', (select count(*) from public.observations where verification_status = 'PENDING'),
    'updated_at', now()
  );
$$;
revoke all on function public.public_home_impact() from public, anon, authenticated;
grant execute on function public.public_home_impact() to service_role;

create or replace function public.public_school_map(p_country text default null, p_state text default null)
returns jsonb
language sql
stable
security definer set search_path = ''
as $$
with selected as (
  select coalesce(s.catalog_source, 'GEOMENTOR') as source,
    coalesce(s.catalog_external_id, s.id::text) as source_id,
    s.name,
    s.school_type,
    s.country_code::text as country_code,
    s.state_region,
    s.district_lga,
    s.city,
    s.location,
    true as programme_member
  from public.schools s
  where s.verification_status = 'VERIFIED' and s.location is not null
    and (p_country is null or s.country_code = upper(p_country))
    and (p_state is null or lower(coalesce(s.state_region, 'Unspecified')) = lower(p_state))
)
select case
  when p_country is null then jsonb_build_object(
    'level', 'country',
    'items', coalesce((select jsonb_agg(row_data order by row_data->>'label') from (
      select jsonb_build_object('key', country_code, 'label', country_code, 'count', count(*),
        'latitude', avg(public.st_y(location)), 'longitude', avg(public.st_x(location))) row_data
      from selected group by country_code
    ) q), '[]'::jsonb)
  )
  when p_state is null then jsonb_build_object(
    'level', 'state', 'country', upper(p_country),
    'items', coalesce((select jsonb_agg(row_data order by row_data->>'label') from (
      select jsonb_build_object('key', coalesce(state_region, 'Unspecified'),
        'label', coalesce(state_region, 'Unspecified'), 'count', count(*),
        'latitude', avg(public.st_y(location)), 'longitude', avg(public.st_x(location))) row_data
      from selected group by coalesce(state_region, 'Unspecified')
    ) q), '[]'::jsonb)
  )
  else jsonb_build_object(
    'level', 'school', 'country', upper(p_country), 'state', p_state,
    'items', coalesce((select jsonb_agg(jsonb_build_object(
      'key', source || ':' || source_id, 'label', name, 'name', name, 'school_type', school_type,
      'country_code', country_code, 'state_region', state_region, 'district_lga', district_lga,
      'city', city, 'latitude', public.st_y(location), 'longitude', public.st_x(location),
      'source', source, 'source_id', source_id, 'programme_member', programme_member
    ) order by name) from selected), '[]'::jsonb)
  )
end;
$$;
revoke all on function public.public_school_map(text, text) from public, anon, authenticated;
grant execute on function public.public_school_map(text, text) to service_role;

create or replace function public.search_school_catalog(p_query text, p_country text default null, p_limit integer default 12)
returns jsonb
language sql
stable
security definer set search_path = ''
as $$
with matches as (
  select coalesce(catalog_source, 'GEOMENTOR') as source,
    coalesce(catalog_external_id, id::text) as source_id,
    name,
    school_type,
    country_code::text as country_code,
    state_region,
    district_lga,
    city,
    public.st_y(location) latitude,
    public.st_x(location) longitude,
    true as programme_member
  from public.schools
  where verification_status = 'VERIFIED' and location is not null
    and char_length(trim(p_query)) >= 2 and name ilike '%' || trim(p_query) || '%'
    and (p_country is null or country_code = upper(p_country))
  order by name
  limit least(greatest(p_limit, 1), 20)
)
select coalesce(jsonb_agg(to_jsonb(matches)), '[]'::jsonb) from matches;
$$;
revoke all on function public.search_school_catalog(text, text, integer) from public, anon, authenticated;
grant execute on function public.search_school_catalog(text, text, integer) to service_role;

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
  proposed_location public.geometry(Point, 4326);
begin
  if not private.is_platform_admin() then raise exception 'Platform administrator role required'; end if;
  if review_decision not in ('VERIFIED', 'REJECTED', 'NEEDS_CHANGES') then raise exception 'Invalid review decision'; end if;
  select * into application from public.registration_applications where id = application_id and status = 'PENDING' for update;
  if application.id is null then raise exception 'Pending application not found'; end if;

  if application.proposed_latitude is not null then
    proposed_location := public.st_setsrid(public.st_makepoint(application.proposed_longitude, application.proposed_latitude), 4326);
  end if;

  if review_decision = 'VERIFIED' then
    if application.application_type = 'SCHOOL' then
      insert into public.organizations (name, organization_type, country_code)
      values (application.organization_name, 'SCHOOL', application.country_code) returning id into created_org;
      insert into public.schools (organization_id, name, country_code, state_region, city, location,
        catalog_source, catalog_external_id, verification_status, created_by)
      values (created_org, application.organization_name, application.country_code, application.state_region,
        application.city, proposed_location, application.catalog_source, application.catalog_external_id,
        'VERIFIED', application.applicant_user_id) returning id into created_school;
      insert into public.organization_memberships (organization_id, user_id, role, status, invited_by)
      values (created_org, application.applicant_user_id, 'SCHOOL_ADMIN', 'VERIFIED', auth.uid());
    else
      created_org := '00000000-0000-4000-8000-000000000001';
      assigned_role := case when application.application_type = 'PARTNER' then 'PARTNER'::public.app_role else 'MENTOR'::public.app_role end;
      insert into public.organization_memberships (organization_id, user_id, role, status, invited_by)
      values (created_org, application.applicant_user_id, assigned_role, 'VERIFIED', auth.uid())
      on conflict (organization_id, user_id, role) do update set status = 'VERIFIED', invited_by = auth.uid();
    end if;
  end if;
  update public.registration_applications set status = review_decision, reviewed_by = auth.uid(),
    review_notes = nullif(trim(notes), ''), reviewed_at = now(), updated_at = now() where id = application.id;
  insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), created_org, 'REGISTRATION_' || review_decision::text, 'registration_application',
    application.id, jsonb_build_object('application_type', application.application_type));
  return jsonb_build_object('status', review_decision, 'organization_id', created_org, 'school_id', created_school);
end;
$$;
revoke all on function public.review_registration_application(uuid, public.verification_status, text) from public;
grant execute on function public.review_registration_application(uuid, public.verification_status, text) to authenticated;

create or replace function public.admin_deactivate_account(p_user_id uuid, p_reason text default null)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
begin
  if not private.is_platform_admin() then
    raise exception 'Platform administrator role required';
  end if;
  if p_user_id is null then
    raise exception 'User id is required';
  end if;

  update public.profiles
  set suspended_at = coalesce(suspended_at, now()), updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'User profile not found';
  end if;

  update auth.users
  set banned_until = '9999-12-31 23:59:59+00'::timestamptz
  where id = p_user_id;

  insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    null,
    'ACCOUNT_DEACTIVATED',
    'profile',
    p_user_id,
    jsonb_build_object('reason', nullif(trim(p_reason), ''), 'suspended_at', now())
  );

  return jsonb_build_object('user_id', p_user_id, 'status', 'DEACTIVATED');
end;
$$;
revoke all on function public.admin_deactivate_account(uuid, text) from public;
grant execute on function public.admin_deactivate_account(uuid, text) to authenticated;

create or replace function public.admin_delete_account(p_user_id uuid, p_reason text default null)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  target_user public.profiles%rowtype;
begin
  if not private.is_platform_admin() then
    raise exception 'Platform administrator role required';
  end if;
  if p_user_id is null then
    raise exception 'User id is required';
  end if;
  if p_user_id = auth.uid() then
    raise exception 'Administrators cannot delete their own account from this interface';
  end if;

  select * into target_user from public.profiles where id = p_user_id for update;
  if target_user.id is null then
    raise exception 'User profile not found';
  end if;

  insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
  values (
    auth.uid(),
    null,
    'ACCOUNT_DELETED',
    'profile',
    p_user_id,
    jsonb_build_object('reason', nullif(trim(p_reason), ''), 'deleted_at', now())
  );

  delete from auth.users where id = p_user_id;
  if not found then
    raise exception 'Auth user not found';
  end if;

  return jsonb_build_object('user_id', p_user_id, 'status', 'DELETED');
end;
$$;
revoke all on function public.admin_delete_account(uuid, text) from public;
grant execute on function public.admin_delete_account(uuid, text) to authenticated;

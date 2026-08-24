-- GeoMentor Africa pilot foundation
-- PostgreSQL 15+ / Supabase. Apply through the migration pipeline, never ad hoc in production.

create extension if not exists pgcrypto;
create extension if not exists postgis;

create type public.app_role as enum (
  'PLATFORM_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'MENTOR', 'EXPERT'
);
create type public.verification_status as enum (
  'PENDING', 'VERIFIED', 'REJECTED', 'NEEDS_CHANGES'
);
create type public.record_visibility as enum ('PRIVATE', 'SCHOOL', 'PROJECT', 'PUBLIC', 'RESTRICTED');
create type public.observation_type as enum ('TREE', 'PLANT', 'BIRD', 'INSECT', 'POLLINATOR', 'ANIMAL', 'FUNGI', 'HABITAT', 'OTHER');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 180),
  organization_type text not null check (organization_type in ('SCHOOL', 'UNIVERSITY', 'NGO', 'GOVERNMENT', 'RESEARCH', 'PARTNER')),
  country_code char(2) not null default 'NG',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 80),
  avatar_path text,
  safeguarding_acknowledged_at timestamptz,
  suspended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  status public.verification_status not null default 'PENDING',
  invited_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id, role)
);
create index organization_memberships_user_idx on public.organization_memberships(user_id, organization_id);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 180),
  school_type text,
  country_code char(2) not null default 'NG',
  state_region text,
  district_lga text,
  city text,
  location geometry(Point, 4326),
  verification_status public.verification_status not null default 'PENDING',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index schools_location_gix on public.schools using gist(location);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  school_id uuid references public.schools(id) on delete restrict,
  title text not null check (char_length(title) between 3 and 180),
  project_type text not null,
  description text not null default '',
  status text not null default 'ACTIVE' check (status in ('DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
  visibility public.record_visibility not null default 'SCHOOL',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_org_idx on public.projects(organization_id, status);

create table public.mentor_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  mentor_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING', 'ACTIVE', 'COMPLETED', 'SUSPENDED')),
  starts_on date,
  ends_on date,
  approved_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (school_id, mentor_id)
);

create table public.gardens (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  school_id uuid not null references public.schools(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null check (char_length(name) between 2 and 120),
  boundary geometry(Polygon, 4326) not null,
  visibility public.record_visibility not null default 'SCHOOL',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (st_isvalid(boundary))
);
create index gardens_boundary_gix on public.gardens using gist(boundary);

create table public.observations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  school_id uuid not null references public.schools(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  garden_id uuid references public.gardens(id) on delete set null,
  observer_id uuid not null references public.profiles(id) on delete restrict,
  observation_type public.observation_type not null,
  common_name text check (common_name is null or char_length(common_name) <= 120),
  scientific_name text check (scientific_name is null or char_length(scientific_name) <= 180),
  notes text not null check (char_length(notes) between 10 and 1000),
  observed_at timestamptz not null,
  location geometry(Point, 4326) not null,
  coordinate_accuracy_m numeric(8,2) check (coordinate_accuracy_m between 0 and 50000),
  verification_status public.verification_status not null default 'PENDING',
  visibility public.record_visibility not null default 'SCHOOL',
  sensitivity_level text not null default 'STANDARD' check (sensitivity_level in ('STANDARD', 'SENSITIVE', 'CRITICAL')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index observations_location_gix on public.observations using gist(location);
create index observations_org_status_idx on public.observations(organization_id, verification_status, observed_at desc);
create index observations_observer_idx on public.observations(observer_id, created_at desc);

create table public.observation_media (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  storage_path text not null unique,
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  sha256 text not null check (char_length(sha256) = 64),
  moderation_status text not null default 'PENDING' check (moderation_status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now()
);

create table public.identification_suggestions (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  provider text not null,
  model_version text not null,
  scientific_name text,
  common_name text,
  confidence numeric(5,4) check (confidence between 0 and 1),
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.expert_reviews (
  id uuid primary key default gen_random_uuid(),
  observation_id uuid not null references public.observations(id) on delete cascade,
  expert_id uuid not null references public.profiles(id) on delete restrict,
  decision public.verification_status not null check (decision in ('VERIFIED', 'REJECTED', 'NEEDS_CHANGES')),
  scientific_name text,
  review_notes text not null check (char_length(review_notes) between 3 and 1000),
  created_at timestamptz not null default now(),
  unique (observation_id, expert_id)
);

create table public.guardian_consents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  consent_version text not null,
  consent_method text not null check (consent_method in ('PAPER', 'DIGITAL', 'SCHOOL_AUTHORITY')),
  recorded_by uuid not null references public.profiles(id),
  granted_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  organization_id uuid references public.organizations(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
create index audit_events_org_time_idx on public.audit_events(organization_id, occurred_at desc);

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.is_platform_admin()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.organization_memberships
    where user_id = auth.uid() and role = 'PLATFORM_ADMIN' and status = 'VERIFIED'
  );
$$;

create or replace function private.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.organization_memberships
    where organization_id = target_org and user_id = auth.uid() and status = 'VERIFIED'
  );
$$;

create or replace function private.has_org_role(target_org uuid, allowed_roles public.app_role[])
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.organization_memberships
    where organization_id = target_org and user_id = auth.uid()
      and status = 'VERIFIED' and role = any(allowed_roles)
  );
$$;

revoke all on all functions in schema private from public;
grant usage on schema private to authenticated;
grant execute on function private.is_platform_admin() to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;
grant execute on function private.has_org_role(uuid, public.app_role[]) to authenticated;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.schools enable row level security;
alter table public.projects enable row level security;
alter table public.mentor_assignments enable row level security;
alter table public.gardens enable row level security;
alter table public.observations enable row level security;
alter table public.observation_media enable row level security;
alter table public.identification_suggestions enable row level security;
alter table public.expert_reviews enable row level security;
alter table public.guardian_consents enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_read_self on public.profiles for select to authenticated using (id = auth.uid() or private.is_platform_admin());
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid() and suspended_at is null) with check (id = auth.uid());
create policy organizations_read_member on public.organizations for select to authenticated using (private.is_org_member(id) or private.is_platform_admin());
create policy memberships_read on public.organization_memberships for select to authenticated using (user_id = auth.uid() or private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER']::public.app_role[]) or private.is_platform_admin());
create policy schools_read on public.schools for select to authenticated using (private.is_org_member(organization_id) or private.is_platform_admin());
create policy schools_manage on public.schools for all to authenticated using (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin()) with check (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin());
create policy projects_read on public.projects for select to authenticated using (visibility = 'PUBLIC' or private.is_org_member(organization_id) or private.is_platform_admin());
create policy projects_manage on public.projects for all to authenticated using (private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER','MENTOR']::public.app_role[]) or private.is_platform_admin()) with check (private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER','MENTOR']::public.app_role[]) or private.is_platform_admin());
create policy assignments_read on public.mentor_assignments for select to authenticated using (mentor_id = auth.uid() or private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER']::public.app_role[]) or private.is_platform_admin());
create policy gardens_read on public.gardens for select to authenticated using ((visibility = 'PUBLIC' and private.is_org_member(organization_id)) or private.is_org_member(organization_id) or private.is_platform_admin());
create policy gardens_manage on public.gardens for all to authenticated using (private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER','MENTOR']::public.app_role[]) or private.is_platform_admin()) with check (private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER','MENTOR']::public.app_role[]) or private.is_platform_admin());
create policy observations_read on public.observations for select to authenticated using (observer_id = auth.uid() or private.is_org_member(organization_id) or private.is_platform_admin());
create policy observations_insert on public.observations for insert to authenticated with check (observer_id = auth.uid() and private.is_org_member(organization_id));
create policy observations_update_owner_pending on public.observations for update to authenticated using (observer_id = auth.uid() and verification_status = 'PENDING') with check (observer_id = auth.uid() and verification_status = 'PENDING');
create policy observations_review on public.observations for update to authenticated using (private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER','EXPERT']::public.app_role[]) or private.is_platform_admin()) with check (private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER','EXPERT']::public.app_role[]) or private.is_platform_admin());
create policy media_read on public.observation_media for select to authenticated using (exists (select 1 from public.observations o where o.id = observation_id));
create policy media_insert on public.observation_media for insert to authenticated with check (exists (select 1 from public.observations o where o.id = observation_id and o.observer_id = auth.uid() and o.verification_status = 'PENDING'));
create policy suggestions_read on public.identification_suggestions for select to authenticated using (exists (select 1 from public.observations o where o.id = observation_id));
create policy reviews_read on public.expert_reviews for select to authenticated using (exists (select 1 from public.observations o where o.id = observation_id));
create policy reviews_insert on public.expert_reviews for insert to authenticated with check (expert_id = auth.uid() and exists (select 1 from public.observations o where o.id = observation_id and private.has_org_role(o.organization_id, array['EXPERT']::public.app_role[])));
create policy consents_read on public.guardian_consents for select to authenticated using (student_id = auth.uid() or private.has_org_role(organization_id, array['SCHOOL_ADMIN','TEACHER']::public.app_role[]) or private.is_platform_admin());
create policy audit_admin_read on public.audit_events for select to authenticated using (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin());

revoke all on all tables in schema public from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.organizations, public.organization_memberships, public.mentor_assignments, public.guardian_consents, public.audit_events to authenticated;
grant select, insert, update on public.schools, public.projects, public.gardens, public.observations to authenticated;
grant select, insert on public.observation_media, public.expert_reviews to authenticated;
grant select on public.identification_suggestions to authenticated;

-- Public map data must be exposed through a separately reviewed, security-invoker view
-- that removes observer identity, exact sensitive coordinates, and unmoderated media.

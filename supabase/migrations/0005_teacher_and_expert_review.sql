-- Controlled student -> teacher -> expert observation review workflow.

alter table public.observations
  add column review_stage text not null default 'TEACHER_REVIEW'
    check (review_stage in ('TEACHER_REVIEW', 'EXPERT_REVIEW', 'STUDENT_REVISION', 'CLOSED')),
  add column teacher_review_notes text check (teacher_review_notes is null or char_length(teacher_review_notes) <= 1000),
  add column teacher_reviewed_by uuid references public.profiles(id),
  add column teacher_reviewed_at timestamptz;

create index observations_review_stage_idx on public.observations(review_stage, verification_status, created_at);

create or replace function private.has_verified_role(allowed_roles public.app_role[])
returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from public.organization_memberships
    where user_id = auth.uid() and status = 'VERIFIED' and role = any(allowed_roles)
  );
$$;
revoke all on function private.has_verified_role(public.app_role[]) from public;
grant execute on function private.has_verified_role(public.app_role[]) to authenticated;

drop policy if exists observations_update_owner_pending on public.observations;
drop policy if exists observations_review on public.observations;
drop policy if exists reviews_insert on public.expert_reviews;

create policy observations_update_owner_revision on public.observations
for update to authenticated
using (
  observer_id = auth.uid()
  and review_stage in ('TEACHER_REVIEW', 'STUDENT_REVISION')
  and verification_status in ('PENDING', 'NEEDS_CHANGES')
)
with check (
  observer_id = auth.uid()
  and review_stage in ('TEACHER_REVIEW', 'STUDENT_REVISION')
  and verification_status in ('PENDING', 'NEEDS_CHANGES')
);

create policy observations_expert_queue_read on public.observations
for select to authenticated
using (
  private.has_verified_role(array['EXPERT']::public.app_role[])
  and (review_stage = 'EXPERT_REVIEW' or reviewed_by = auth.uid())
);

create policy reviews_expert_read_own on public.expert_reviews
for select to authenticated
using (expert_id = auth.uid() or private.is_platform_admin());

revoke insert on public.expert_reviews from authenticated;

create or replace function public.review_observation_as_teacher(
  target_observation uuid,
  teacher_decision text,
  review_notes text
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  observation public.observations%rowtype;
  next_stage text;
  next_status public.verification_status;
begin
  select * into observation from public.observations where id = target_observation and review_stage = 'TEACHER_REVIEW' for update;
  if observation.id is null then raise exception 'Observation is not awaiting teacher review'; end if;
  if not (private.has_org_role(observation.organization_id, array['SCHOOL_ADMIN','TEACHER']::public.app_role[]) or private.is_platform_admin()) then raise exception 'Verified teacher role required'; end if;
  if char_length(coalesce(trim(review_notes), '')) not between 3 and 1000 then raise exception 'Review notes must contain 3 to 1000 characters'; end if;

  if teacher_decision = 'SUBMIT_TO_EXPERT' then next_stage := 'EXPERT_REVIEW'; next_status := 'PENDING';
  elsif teacher_decision = 'NEEDS_CHANGES' then next_stage := 'STUDENT_REVISION'; next_status := 'NEEDS_CHANGES';
  elsif teacher_decision = 'REJECTED' then next_stage := 'CLOSED'; next_status := 'REJECTED';
  else raise exception 'Invalid teacher decision';
  end if;

  update public.observations set review_stage = next_stage, verification_status = next_status,
    teacher_review_notes = trim(review_notes), teacher_reviewed_by = auth.uid(), teacher_reviewed_at = now(), updated_at = now()
  where id = observation.id;
  insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), observation.organization_id, 'TEACHER_' || teacher_decision, 'observation', observation.id, jsonb_build_object('next_stage', next_stage));
  return jsonb_build_object('status', next_status, 'review_stage', next_stage);
end;
$$;
revoke all on function public.review_observation_as_teacher(uuid, text, text) from public;
grant execute on function public.review_observation_as_teacher(uuid, text, text) to authenticated;

create or replace function public.review_observation_as_expert(
  target_observation uuid,
  expert_decision public.verification_status,
  confirmed_scientific_name text,
  review_notes text
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  observation public.observations%rowtype;
  next_stage text;
begin
  if not private.has_verified_role(array['EXPERT']::public.app_role[]) then raise exception 'Verified expert role required'; end if;
  select * into observation from public.observations where id = target_observation and review_stage = 'EXPERT_REVIEW' for update;
  if observation.id is null then raise exception 'Observation is not awaiting expert review'; end if;
  if expert_decision not in ('VERIFIED', 'REJECTED', 'NEEDS_CHANGES') then raise exception 'Invalid expert decision'; end if;
  if char_length(coalesce(trim(review_notes), '')) not between 3 and 1000 then raise exception 'Review notes must contain 3 to 1000 characters'; end if;
  if expert_decision = 'VERIFIED' and char_length(coalesce(trim(confirmed_scientific_name), '')) not between 3 and 180 then raise exception 'A scientific name is required for verification'; end if;

  next_stage := case when expert_decision = 'NEEDS_CHANGES' then 'STUDENT_REVISION' else 'CLOSED' end;
  insert into public.expert_reviews (observation_id, expert_id, decision, scientific_name, review_notes)
  values (observation.id, auth.uid(), expert_decision, nullif(trim(confirmed_scientific_name), ''), trim(review_notes))
  on conflict (observation_id, expert_id) do update set decision = excluded.decision, scientific_name = excluded.scientific_name, review_notes = excluded.review_notes, created_at = now();

  update public.observations set verification_status = expert_decision, review_stage = next_stage,
    scientific_name = case when expert_decision = 'VERIFIED' then trim(confirmed_scientific_name) else scientific_name end,
    reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  where id = observation.id;
  insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), observation.organization_id, 'EXPERT_' || expert_decision::text, 'observation', observation.id, jsonb_build_object('scientific_name', nullif(trim(confirmed_scientific_name), '')));
  return jsonb_build_object('status', expert_decision, 'review_stage', next_stage);
end;
$$;
revoke all on function public.review_observation_as_expert(uuid, public.verification_status, text, text) from public;
grant execute on function public.review_observation_as_expert(uuid, public.verification_status, text, text) to authenticated;

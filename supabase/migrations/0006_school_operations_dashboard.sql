-- School-scoped operational summary for verified teachers and school administrators.

create or replace function public.get_school_operations_dashboard()
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  membership public.organization_memberships%rowtype;
  selected_school public.schools%rowtype;
  result jsonb;
begin
  select * into membership from public.organization_memberships
  where user_id = auth.uid() and status = 'VERIFIED' and role in ('SCHOOL_ADMIN', 'TEACHER')
  order by case when role = 'SCHOOL_ADMIN' then 0 else 1 end, created_at limit 1;
  if membership.id is null then raise exception 'Verified school staff role required'; end if;

  select * into selected_school from public.schools
  where organization_id = membership.organization_id order by created_at limit 1;
  if selected_school.id is null then raise exception 'No school is configured for this organization'; end if;

  select jsonb_build_object(
    'school', jsonb_build_object('id', selected_school.id, 'name', selected_school.name, 'country_code', selected_school.country_code),
    'role', membership.role,
    'metrics', jsonb_build_object(
      'verified_students', (select count(*) from public.organization_memberships where organization_id = membership.organization_id and role = 'STUDENT' and status = 'VERIFIED'),
      'pending_students', (select count(*) from public.student_join_requests where school_id = selected_school.id and consent_status = 'PENDING'),
      'teacher_review', (select count(*) from public.observations where school_id = selected_school.id and review_stage = 'TEACHER_REVIEW' and verification_status = 'PENDING'),
      'expert_review', (select count(*) from public.observations where school_id = selected_school.id and review_stage = 'EXPERT_REVIEW' and verification_status = 'PENDING'),
      'verified_observations', (select count(*) from public.observations where school_id = selected_school.id and verification_status = 'VERIFIED'),
      'active_projects', (select count(*) from public.projects where organization_id = membership.organization_id and status = 'ACTIVE')
    ),
    'recent_observations', coalesce((
      select jsonb_agg(row_data order by observed_at desc) from (
        select o.id, o.observation_type, o.common_name, o.scientific_name, o.verification_status, o.review_stage, o.observed_at, o.sensitivity_level,
          case when o.sensitivity_level = 'CRITICAL' then null else round(st_y(o.location)::numeric, 4) end as latitude,
          case when o.sensitivity_level = 'CRITICAL' then null else round(st_x(o.location)::numeric, 4) end as longitude
        from public.observations o where o.school_id = selected_school.id order by o.observed_at desc limit 12
      ) row_data
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

revoke all on function public.get_school_operations_dashboard() from public;
grant execute on function public.get_school_operations_dashboard() to authenticated;

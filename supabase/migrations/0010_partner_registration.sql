-- Allow reviewed Geo-Partner applications and assign them to the network organization.
alter table public.registration_applications drop constraint if exists registration_applications_application_type_check;
alter table public.registration_applications add constraint registration_applications_application_type_check
  check (application_type in ('SCHOOL', 'MENTOR', 'PARTNER'));

alter table public.registration_applications drop constraint if exists registration_applications_check1;
alter table public.registration_applications drop constraint if exists registration_applications_check2;
alter table public.registration_applications add constraint registration_application_organization_required
  check ((application_type in ('SCHOOL', 'PARTNER') and organization_name is not null) or application_type = 'MENTOR');
alter table public.registration_applications add constraint registration_application_credentials_required
  check ((application_type in ('MENTOR', 'PARTNER') and credentials_summary is not null) or application_type = 'SCHOOL');

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
      values (application.organization_name, 'SCHOOL', application.country_code) returning id into created_org;
      insert into public.schools (organization_id, name, country_code, state_region, city, verification_status, created_by)
      values (created_org, application.organization_name, application.country_code, application.state_region, application.city, 'VERIFIED', application.applicant_user_id)
      returning id into created_school;
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

  update public.registration_applications set status = review_decision, reviewed_by = auth.uid(), review_notes = nullif(trim(notes), ''), reviewed_at = now(), updated_at = now()
  where id = application.id;
  insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), created_org, 'REGISTRATION_' || review_decision::text, 'registration_application', application.id, jsonb_build_object('application_type', application.application_type));
  return jsonb_build_object('status', review_decision, 'organization_id', created_org, 'school_id', created_school);
end;
$$;
revoke all on function public.review_registration_application(uuid, public.verification_status, text) from public;
grant execute on function public.review_registration_application(uuid, public.verification_status, text) to authenticated;

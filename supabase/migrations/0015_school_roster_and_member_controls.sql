-- School membership roster access and school-admin controls for students and staff.

create policy memberships_school_admin_update on public.organization_memberships
for update to authenticated
using (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin())
with check (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin());

create policy memberships_school_admin_delete on public.organization_memberships
for delete to authenticated
using (private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[]) or private.is_platform_admin());

grant update, delete on public.organization_memberships to authenticated;

create or replace function public.get_school_member_roster()
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  school_org uuid;
  roster jsonb;
begin
  select organization_id into school_org
  from public.organization_memberships
  where user_id = auth.uid() and role = 'SCHOOL_ADMIN' and status = 'VERIFIED'
  order by created_at
  limit 1;

  if school_org is null then
    raise exception 'School administrator role required';
  end if;

  select jsonb_agg(member order by member->>'display_name') into roster
  from (
    select jsonb_build_object(
      'user_id', m.user_id,
      'display_name', p.display_name,
      'role', m.role,
      'status', m.status,
      'suspended_at', p.suspended_at,
      'joined_at', m.created_at
    ) as member
    from public.organization_memberships m
    join public.profiles p on p.id = m.user_id
    where m.organization_id = school_org
      and m.role in ('SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  ) items;

  return coalesce(roster, '[]'::jsonb);
end;
$$;

revoke all on function public.get_school_member_roster() from public;
grant execute on function public.get_school_member_roster() to authenticated;

create or replace function public.school_admin_manage_member(p_user_id uuid, p_action text, p_reason text default null)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  school_org uuid;
  target_membership public.organization_memberships%rowtype;
begin
  if p_user_id is null then
    raise exception 'User id is required';
  end if;

  select organization_id into school_org
  from public.organization_memberships
  where user_id = auth.uid() and role = 'SCHOOL_ADMIN' and status = 'VERIFIED'
  order by created_at
  limit 1;

  if school_org is null then
    raise exception 'School administrator role required';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own school access from this control';
  end if;

  select * into target_membership
  from public.organization_memberships
  where organization_id = school_org and user_id = p_user_id and role in ('SCHOOL_ADMIN', 'TEACHER', 'STUDENT')
  limit 1;

  if target_membership.organization_id is null then
    raise exception 'This user is not a member of your school';
  end if;

  if p_action = 'SUSPEND' then
    update public.profiles
    set suspended_at = coalesce(suspended_at, now()), updated_at = now()
    where id = p_user_id;

    insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), school_org, 'SCHOOL_MEMBER_SUSPENDED', 'profile', p_user_id, jsonb_build_object('reason', nullif(trim(p_reason), ''), 'suspended_at', now()));

    return jsonb_build_object('action', 'SUSPEND', 'user_id', p_user_id, 'status', 'SUSPENDED');
  elsif p_action = 'REACTIVATE' then
    update public.profiles
    set suspended_at = null, updated_at = now()
    where id = p_user_id;

    insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), school_org, 'SCHOOL_MEMBER_REACTIVATED', 'profile', p_user_id, jsonb_build_object('reason', nullif(trim(p_reason), ''), 'reactivated_at', now()));

    return jsonb_build_object('action', 'REACTIVATE', 'user_id', p_user_id, 'status', 'ACTIVE');
  elsif p_action = 'REMOVE' then
    delete from public.organization_memberships
    where organization_id = school_org and user_id = p_user_id and role in ('SCHOOL_ADMIN', 'TEACHER', 'STUDENT');

    insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), school_org, 'SCHOOL_MEMBER_REMOVED', 'profile', p_user_id, jsonb_build_object('reason', nullif(trim(p_reason), ''), 'removed_at', now()));

    return jsonb_build_object('action', 'REMOVE', 'user_id', p_user_id, 'status', 'REMOVED');
  else
    raise exception 'Unsupported member action';
  end if;
end;
$$;

revoke all on function public.school_admin_manage_member(uuid, text, text) from public;
grant execute on function public.school_admin_manage_member(uuid, text, text) to authenticated;

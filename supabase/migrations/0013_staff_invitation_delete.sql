drop policy if exists staff_invites_school_admin_delete on public.staff_invitations;

create policy staff_invites_school_admin_delete on public.staff_invitations
for delete to authenticated
using (
  private.has_org_role(organization_id, array['SCHOOL_ADMIN']::public.app_role[])
  or private.is_platform_admin()
);

grant delete on public.staff_invitations to authenticated;

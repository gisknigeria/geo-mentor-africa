-- Let verified mentors discover approved schools and add them to their portfolio.

create policy schools_verified_mentor_read on public.schools
for select to authenticated
using (
  verification_status = 'VERIFIED'
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = auth.uid()
      and m.role = 'MENTOR'
      and m.status = 'VERIFIED'
  )
);

create policy assignments_mentor_insert on public.mentor_assignments
for insert to authenticated
with check (
  mentor_id = auth.uid()
  and status = 'ACTIVE'
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = auth.uid()
      and m.role = 'MENTOR'
      and m.status = 'VERIFIED'
  )
  and exists (
    select 1
    from public.schools s
    where s.id = school_id
      and s.organization_id = organization_id
      and s.verification_status = 'VERIFIED'
  )
);

grant insert on public.mentor_assignments to authenticated;

-- Allow verified platform administrators to permanently remove any biodiversity capture.
-- The existing observations_read and observations_review policies already grant admins
-- visibility and updates; this adds the missing delete capability.
create policy observations_delete_platform_admin on public.observations
for delete to authenticated
using (private.is_platform_admin());

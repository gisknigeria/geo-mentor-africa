-- Publish the privacy-sanitized legacy field records for the biodiversity commons.
-- Identifying student fields were not imported and public coordinates are rounded by the API.

update public.observations
set visibility = 'PUBLIC', updated_at = now()
where project_id in (
  'a3000000-0000-4000-8000-000000000001',
  'a3000000-0000-4000-8000-000000000002'
);

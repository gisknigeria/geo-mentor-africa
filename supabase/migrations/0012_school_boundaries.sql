alter table public.schools
  add column if not exists boundary geometry(Polygon, 4326);

create index if not exists schools_boundary_gix on public.schools using gist(boundary);

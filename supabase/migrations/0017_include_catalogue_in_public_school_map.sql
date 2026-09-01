-- Include source-attributed catalogue schools in the public atlas.
-- Verified GeoMentor schools win when a catalogue record has been claimed.

create or replace function public.public_school_map(p_country text default null, p_state text default null)
returns jsonb
language sql
stable
security definer set search_path = ''
as $$
with all_schools as (
  select coalesce(s.catalog_source, 'GEOMENTOR') as source,
    coalesce(s.catalog_external_id, s.id::text) as source_id,
    s.name,
    s.school_type,
    s.country_code::text as country_code,
    s.state_region,
    s.district_lga,
    s.city,
    s.location,
    true as programme_member
  from public.schools s
  where s.verification_status = 'VERIFIED' and s.location is not null

  union all

  select c.source,
    c.source_id,
    c.name,
    c.school_type,
    c.country_code::text,
    c.state_region,
    c.district_lga,
    c.city,
    c.location,
    false
  from public.school_catalog c
  where not exists (
    select 1 from public.schools s
    where s.verification_status = 'VERIFIED'
      and s.catalog_source = c.source
      and s.catalog_external_id = c.source_id
  )
),
selected as (
  select * from all_schools
  where (p_country is null or country_code = upper(p_country))
    and (p_state is null or lower(coalesce(state_region, 'Unspecified')) = lower(p_state))
)
select case
  when p_country is null then jsonb_build_object(
    'level', 'country',
    'items', coalesce((select jsonb_agg(row_data order by row_data->>'label') from (
      select jsonb_build_object(
        'key', country_code,
        'label', country_code,
        'count', count(*),
        'latitude', avg(public.st_y(location)),
        'longitude', avg(public.st_x(location))
      ) row_data
      from selected
      group by country_code
    ) q), '[]'::jsonb)
  )
  when p_state is null then jsonb_build_object(
    'level', 'state',
    'country', upper(p_country),
    'items', coalesce((select jsonb_agg(row_data order by row_data->>'label') from (
      select jsonb_build_object(
        'key', coalesce(state_region, 'Unspecified'),
        'label', coalesce(state_region, 'Unspecified'),
        'count', count(*),
        'latitude', avg(public.st_y(location)),
        'longitude', avg(public.st_x(location))
      ) row_data
      from selected
      group by coalesce(state_region, 'Unspecified')
    ) q), '[]'::jsonb)
  )
  else jsonb_build_object(
    'level', 'school',
    'country', upper(p_country),
    'state', p_state,
    'items', coalesce((select jsonb_agg(jsonb_build_object(
      'key', source || ':' || source_id,
      'label', name,
      'name', name,
      'school_type', school_type,
      'country_code', country_code,
      'state_region', state_region,
      'district_lga', district_lga,
      'city', city,
      'latitude', public.st_y(location),
      'longitude', public.st_x(location),
      'source', source,
      'source_id', source_id,
      'programme_member', programme_member
    ) order by name) from selected), '[]'::jsonb)
  )
end;
$$;

revoke all on function public.public_school_map(text, text) from public, anon, authenticated;
grant execute on function public.public_school_map(text, text) to service_role;

create or replace function public.search_school_catalog(p_query text, p_country text default null, p_limit integer default 12)
returns jsonb
language sql
stable
security definer set search_path = ''
as $$
with all_schools as (
  select coalesce(s.catalog_source, 'GEOMENTOR') as source,
    coalesce(s.catalog_external_id, s.id::text) as source_id,
    s.name,
    s.school_type,
    s.country_code::text as country_code,
    s.state_region,
    s.district_lga,
    s.city,
    s.location,
    true as programme_member
  from public.schools s
  where s.verification_status = 'VERIFIED' and s.location is not null

  union all

  select c.source, c.source_id, c.name, c.school_type, c.country_code::text,
    c.state_region, c.district_lga, c.city, c.location, false
  from public.school_catalog c
  where not exists (
    select 1 from public.schools s
    where s.verification_status = 'VERIFIED'
      and s.catalog_source = c.source
      and s.catalog_external_id = c.source_id
  )
),
matches as (
  select source,
    source_id,
    name,
    school_type,
    country_code,
    state_region,
    district_lga,
    city,
    public.st_y(location) latitude,
    public.st_x(location) longitude,
    programme_member
  from all_schools
  where char_length(trim(p_query)) >= 2
    and name ilike '%' || trim(p_query) || '%'
    and (p_country is null or country_code = upper(p_country))
  order by programme_member desc, name
  limit least(greatest(p_limit, 1), 50)
)
select coalesce(jsonb_agg(to_jsonb(matches)), '[]'::jsonb) from matches;
$$;

revoke all on function public.search_school_catalog(text, text, integer) from public, anon, authenticated;
grant execute on function public.search_school_catalog(text, text, integer) to service_role;

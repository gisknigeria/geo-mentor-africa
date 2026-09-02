-- Privacy-safe import of the historical Esri Biotracker / Agrobiodiversity exports.
-- The two exports contain the same 16 submissions. Agrobiodiversity has the newer,
-- corrected Ibadan coordinates, so it is the canonical geometry source. Personal
-- student contact fields and attachment binaries are deliberately not imported.

create table if not exists private.legacy_observation_sources (
  observation_id uuid primary key references public.observations(id) on delete cascade,
  agrobiodiversity_globalid text not null unique,
  biotracker_globalid text not null unique,
  coordinate_source text not null,
  imported_at timestamptz not null default now()
);

insert into public.organizations (id, name, organization_type, country_code, created_at, updated_at)
values
  ('a1000000-0000-4000-8000-000000000001', 'American Christian Academy', 'SCHOOL', 'NG', now(), now()),
  ('a1000000-0000-4000-8000-000000000002', 'Deeper Life High School', 'SCHOOL', 'NG', now(), now())
on conflict (id) do update set
  name = excluded.name,
  organization_type = excluded.organization_type,
  country_code = excluded.country_code,
  updated_at = now();

insert into public.schools (
  id, organization_id, name, school_type, country_code, state_region,
  district_lga, city, location, verification_status, created_by, created_at, updated_at
)
values
  (
    'a2000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'American Christian Academy', 'SECONDARY', 'NG', 'Oyo', 'Ibadan North-West', 'Ibadan',
    public.st_setsrid(public.st_makepoint(3.881126, 7.398180), 4326),
    'VERIFIED', '11111111-1111-4111-8111-111111111111', now(), now()
  ),
  (
    'a2000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000002',
    'Deeper Life High School', 'SECONDARY', 'NG', 'Oyo', 'Ibadan North', 'Ibadan',
    public.st_setsrid(public.st_makepoint(3.902351, 7.413559), 4326),
    'VERIFIED', '11111111-1111-4111-8111-111111111111', now(), now()
  )
on conflict (id) do update set
  name = excluded.name,
  school_type = excluded.school_type,
  country_code = excluded.country_code,
  state_region = excluded.state_region,
  district_lga = excluded.district_lga,
  city = excluded.city,
  location = excluded.location,
  verification_status = excluded.verification_status,
  updated_at = now();

insert into public.projects (
  id, organization_id, school_id, title, project_type, description,
  status, visibility, created_by, created_at, updated_at
)
values
  (
    'a3000000-0000-4000-8000-000000000001',
    'a1000000-0000-4000-8000-000000000001',
    'a2000000-0000-4000-8000-000000000001',
    'Legacy Esri Biodiversity Survey', 'BIODIVERSITY',
    'Historical school biodiversity observations imported from the former Esri Biotracker and Agrobiodiversity applications.',
    'ARCHIVED', 'SCHOOL', '11111111-1111-4111-8111-111111111111', now(), now()
  ),
  (
    'a3000000-0000-4000-8000-000000000002',
    'a1000000-0000-4000-8000-000000000002',
    'a2000000-0000-4000-8000-000000000002',
    'Legacy Esri Biodiversity Survey', 'BIODIVERSITY',
    'Historical school biodiversity observations imported from the former Esri Biotracker and Agrobiodiversity applications.',
    'ARCHIVED', 'SCHOOL', '11111111-1111-4111-8111-111111111111', now(), now()
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  visibility = excluded.visibility,
  updated_at = now();

insert into public.observations (
  id, organization_id, school_id, project_id, observer_id, observation_type,
  common_name, notes, observed_at, location, coordinate_accuracy_m,
  verification_status, visibility, sensitivity_level, review_stage, created_at, updated_at
)
values
  ('a4000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2021-12-15T13:28:00Z',public.st_setsrid(public.st_makepoint(3.881033064,7.398036229),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T13:36:00Z','2022-10-08T21:37:15Z'),
  ('a4000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2021-12-15T13:34:00Z',public.st_setsrid(public.st_makepoint(3.881231547,7.397919194),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T16:17:41.999Z','2022-10-08T21:40:26Z'),
  ('a4000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2021-12-15T13:34:00Z',public.st_setsrid(public.st_makepoint(3.881092073,7.398557565),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T16:26:28Z','2022-10-08T21:39:27.999Z'),
  ('a4000000-0000-4000-8000-000000000004','a1000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','a3000000-0000-4000-8000-000000000001','11111111-1111-4111-8111-111111111111','PLANT','Non-vascular plant','Legacy Esri record: non-vascular plant (algae group); identification pending.','2021-12-15T13:37:00Z',public.st_setsrid(public.st_makepoint(3.881145717,7.398206461),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T16:40:33.999Z','2022-10-08T21:40:20Z'),
  ('a4000000-0000-4000-8000-000000000005','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2022-05-26T11:18:00Z',public.st_setsrid(public.st_makepoint(3.902461232,7.413678712),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T16:55:09Z','2022-10-08T22:08:08.999Z'),
  ('a4000000-0000-4000-8000-000000000006','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2022-05-26T11:18:00Z',public.st_setsrid(public.st_makepoint(3.902048172,7.413537744),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T17:02:24Z','2022-10-08T22:08:49Z'),
  ('a4000000-0000-4000-8000-000000000007','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','TREE','Palm tree','Legacy Esri record: vascular seed-bearing angiosperm recorded as palm tree.','2022-05-26T11:15:00Z',public.st_setsrid(public.st_makepoint(3.902388812,7.413851599),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T17:07:29.999Z','2022-10-08T22:07:49Z'),
  ('a4000000-0000-4000-8000-000000000008','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2022-05-26T11:22:00Z',public.st_setsrid(public.st_makepoint(3.901997210,7.413532424),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T17:11:50Z','2022-10-08T22:15:39Z'),
  ('a4000000-0000-4000-8000-000000000009','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2022-05-26T11:23:00Z',public.st_setsrid(public.st_makepoint(3.902351261,7.413734568),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T17:16:48.999Z','2022-10-08T22:15:56Z'),
  ('a4000000-0000-4000-8000-000000000010','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2022-05-26T11:23:00Z',public.st_setsrid(public.st_makepoint(3.902893067,7.412856838),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T17:20:58Z','2022-10-08T22:12:24.999Z'),
  ('a4000000-0000-4000-8000-000000000011','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','ANIMAL','Lizard','Legacy Esri record: vertebrate animal in the amphibian group, recorded as lizard; identification needs expert review.','2022-05-26T11:23:00Z',public.st_setsrid(public.st_makepoint(3.902423681,7.413809042),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T17:25:35Z','2022-10-08T22:16:04.999Z'),
  ('a4000000-0000-4000-8000-000000000012','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2022-05-26T11:23:00Z',public.st_setsrid(public.st_makepoint(3.902335168,7.413835640),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T17:34:36Z','2022-10-08T22:14:33.999Z'),
  ('a4000000-0000-4000-8000-000000000013','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2022-05-26T11:23:00Z',public.st_setsrid(public.st_makepoint(3.902445138,7.413734568),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T17:54:41Z','2022-10-08T22:16:14Z'),
  ('a4000000-0000-4000-8000-000000000014','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','PLANT','Flower','Legacy Esri record: non-vascular plant in the algae group, also recorded as flower; identification needs expert review.','2022-05-26T11:23:00Z',public.st_setsrid(public.st_makepoint(3.902176918,7.413580300),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T18:00:19Z','2022-10-08T22:16:26.999Z'),
  ('a4000000-0000-4000-8000-000000000015','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','PLANT','Vascular plant','Legacy Esri record: vascular, spore-bearing plant; identification pending.','2022-05-26T11:23:00Z',public.st_setsrid(public.st_makepoint(3.902378083,7.412856838),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T18:20:30.999Z','2022-10-08T22:15:27.999Z'),
  ('a4000000-0000-4000-8000-000000000016','a1000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a3000000-0000-4000-8000-000000000002','11111111-1111-4111-8111-111111111111','PLANT','Flower','Legacy Esri record: vascular seed-bearing angiosperm recorded as flower.','2022-05-26T11:23:00Z',public.st_setsrid(public.st_makepoint(3.902380765,7.413657434),4326),null,'PENDING','SCHOOL','STANDARD','TEACHER_REVIEW','2022-10-08T18:24:24Z','2022-10-08T21:55:25Z')
on conflict (id) do update set
  common_name = excluded.common_name,
  notes = excluded.notes,
  observed_at = excluded.observed_at,
  location = excluded.location,
  updated_at = excluded.updated_at;

insert into private.legacy_observation_sources (
  observation_id, agrobiodiversity_globalid, biotracker_globalid, coordinate_source
)
values
  ('a4000000-0000-4000-8000-000000000001','15254769e62eb4488862ce3f7bfb681a','96774efe8a21a94e8eb3974281c3edbd','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000002','cde98765111340448421f3e533b2bb49','f48f49e266d9d4783fbad316eabce28','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000003','4debecbd1aebf468e5a8dd67e327cbd','19fe6ae0a31b24f81c743614b94aa36','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000004','5c5e996d9802d4588d381bd9179692','621c5ddaaae54408a8faf9cbd84b53','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000005','403f60e52d497d458ebc3ee5623b4deb','47bc8da2cc219e448f97a579d2733b98','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000006','f258dc266eef654382d4d8f6ad7d17e1','78cb2bafb52e85438ac967d64efa2815','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000007','8be29146c9d98478e7db52f1e56911a','9e7b9321a625f74483b84f3681f39b4a','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000008','f55ff2340618d4481e43447573fa4af','6d80dcff6fd06a45809b6ebe27f0d1e','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000009','5ad2bc269960984e8e57f510903887d','ec3f8cdda98aca4282a6931cfdbc66f','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000010','8c8d9e39beb0564a8e693b2e40f24bdc','8f6cc16ff3ce9e498a204c56bfe5ff6','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000011','83342503a7ef14382dd9d19e0dbf478','86145a25f2158849895861d3cc83e0','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000012','c86751c1bc66749822a3f0ef21a016','3cce7436c7abde4388e762caf4048b8','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000013','506ea9ae9af8c468b9678dda32b8aae','653f2ee0dbcb5b4a8c356bafb57b855','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000014','33eede94a0699b4786a0ab77c8cf45cf','2fb7ac46fad25e4e8eae77b593501e1e','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000015','672e5fb7ce3fcc4482419115bd2441ef','7883fa392386c4c8b1fbe89c0dfef7b','Agrobiodiversity App gbd'),
  ('a4000000-0000-4000-8000-000000000016','05fe49dd944f8478288eb9773d1ca4b','36c85d639685544841ce435d7f59037','Agrobiodiversity App gbd')
on conflict (observation_id) do update set
  agrobiodiversity_globalid = excluded.agrobiodiversity_globalid,
  biotracker_globalid = excluded.biotracker_globalid,
  coordinate_source = excluded.coordinate_source,
  imported_at = now();

insert into public.audit_events (actor_id, organization_id, action, entity_type, metadata, occurred_at)
values
  ('11111111-1111-4111-8111-111111111111','a1000000-0000-4000-8000-000000000001','LEGACY_ESRI_IMPORT','project','{"source_exports":["Agrobiodiversity App gbd","Biotracker gbd"],"records":4,"pii_removed":true,"attachments_deferred":true}'::jsonb,now()),
  ('11111111-1111-4111-8111-111111111111','a1000000-0000-4000-8000-000000000002','LEGACY_ESRI_IMPORT','project','{"source_exports":["Agrobiodiversity App gbd","Biotracker gbd"],"records":12,"pii_removed":true,"attachments_deferred":true}'::jsonb,now());

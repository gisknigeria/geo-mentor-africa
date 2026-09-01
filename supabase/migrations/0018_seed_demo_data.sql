-- Demo seed data for the GeoMentor Africa pilot.
-- Safe to re-run: the migration uses upserts and only adds demo content.

-- Ensure the platform organization exists.
insert into public.organizations (id, name, organization_type, country_code)
values ('00000000-0000-4000-8000-000000000001', 'GeoMentor Africa Network', 'NGO', 'NG')
on conflict (id) do update set
  name = excluded.name,
  organization_type = excluded.organization_type,
  country_code = excluded.country_code,
  updated_at = now();

-- Demo auth users for a local seed environment only.
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@geomentor.africa',
    '$2a$10$M3bK5OulxJz1IY9iZcM9a.4B2F8uN2n3tqC7D7QGzP2A0b5XUVv6',
    now(),
    now(),
    '',
    now(),
    '',
    now(),
    '',
    '',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"GeoMentor Admin"}',
    false,
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'teacher@stmonica.edu.ng',
    '$2a$10$M3bK5OulxJz1IY9iZcM9a.4B2F8uN2n3tqC7D7QGzP2A0b5XUVv6',
    now(),
    now(),
    '',
    now(),
    '',
    now(),
    '',
    '',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Amina Bello"}',
    false,
    now(),
    now()
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'mentor@geomentor.africa',
    '$2a$10$M3bK5OulxJz1IY9iZcM9a.4B2F8uN2n3tqC7D7QGzP2A0b5XUVv6',
    now(),
    now(),
    '',
    now(),
    '',
    now(),
    '',
    '',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Tunde Okafor"}',
    false,
    now(),
    now()
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'expert@geomentor.africa',
    '$2a$10$M3bK5OulxJz1IY9iZcM9a.4B2F8uN2n3tqC7D7QGzP2A0b5XUVv6',
    now(),
    now(),
    '',
    now(),
    '',
    now(),
    '',
    '',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Dr. Funke Adebayo"}',
    false,
    now(),
    now()
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'student@stmonica.edu.ng',
    '$2a$10$M3bK5OulxJz1IY9iZcM9a.4B2F8uN2n3tqC7D7QGzP2A0b5XUVv6',
    now(),
    now(),
    '',
    now(),
    '',
    now(),
    '',
    '',
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Chiamaka Eze"}',
    false,
    now(),
    now()
  )
on conflict (id) do nothing;

insert into public.profiles (id, display_name, avatar_path, safeguarding_acknowledged_at, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', 'GeoMentor Admin', null, now(), now(), now()),
  ('22222222-2222-4222-8222-222222222222', 'Amina Bello', null, now(), now(), now()),
  ('33333333-3333-4333-8333-333333333333', 'Tunde Okafor', null, now(), now(), now()),
  ('44444444-4444-4444-8444-444444444444', 'Dr. Funke Adebayo', null, now(), now(), now()),
  ('55555555-5555-4555-8555-555555555555', 'Chiamaka Eze', null, now(), now(), now())
on conflict (id) do update set
  display_name = excluded.display_name,
  avatar_path = excluded.avatar_path,
  safeguarding_acknowledged_at = coalesce(public.profiles.safeguarding_acknowledged_at, excluded.safeguarding_acknowledged_at),
  updated_at = now();

-- Demo school organization and members.
insert into public.organizations (id, name, organization_type, country_code, created_at, updated_at)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'St. Monica Academy', 'SCHOOL', 'NG', now(), now())
on conflict (id) do update set
  name = excluded.name,
  organization_type = excluded.organization_type,
  country_code = excluded.country_code,
  updated_at = now();

insert into public.schools (
  id,
  organization_id,
  name,
  school_type,
  country_code,
  state_region,
  district_lga,
  city,
  location,
  verification_status,
  created_by,
  created_at,
  updated_at
)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'St. Monica Academy',
  'SECONDARY',
  'NG',
  'Oyo',
  'Ibadan South-West',
  'Ibadan',
  public.st_setsrid(public.st_makepoint(3.9050, 7.3775), 4326),
  'VERIFIED',
  '11111111-1111-4111-8111-111111111111',
  now(),
  now()
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

insert into public.organization_memberships (organization_id, user_id, role, status, invited_by, created_at)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'PLATFORM_ADMIN', 'VERIFIED', null, now()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'SCHOOL_ADMIN', 'VERIFIED', '11111111-1111-4111-8111-111111111111', now()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', 'TEACHER', 'VERIFIED', '11111111-1111-4111-8111-111111111111', now()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333', 'MENTOR', 'VERIFIED', '11111111-1111-4111-8111-111111111111', now()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '44444444-4444-4444-8444-444444444444', 'EXPERT', 'VERIFIED', '11111111-1111-4111-8111-111111111111', now()),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '55555555-5555-4555-8555-555555555555', 'STUDENT', 'VERIFIED', '22222222-2222-4222-8222-222222222222', now())
on conflict (organization_id, user_id, role) do update set
  status = excluded.status,
  invited_by = excluded.invited_by,
  created_at = public.organization_memberships.created_at;

-- Demo project, garden and observations.
insert into public.projects (
  id,
  organization_id,
  school_id,
  title,
  project_type,
  description,
  status,
  visibility,
  created_by,
  created_at,
  updated_at
)
values (
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'School Biodiversity Recovery',
  'BIODIVERSITY',
  'Students mapped native species, monitored pollinators, and tracked habitat restoration across the school garden and nearby campus edges.',
  'ACTIVE',
  'SCHOOL',
  '22222222-2222-4222-8222-222222222222',
  now(),
  now()
)
on conflict (id) do update set
  title = excluded.title,
  project_type = excluded.project_type,
  description = excluded.description,
  status = excluded.status,
  visibility = excluded.visibility,
  updated_at = now();

insert into public.gardens (
  id,
  organization_id,
  school_id,
  project_id,
  name,
  boundary,
  visibility,
  created_by,
  created_at,
  updated_at
)
values (
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'Green Lab Garden',
  public.st_geomfromtext('POLYGON((3.9020 7.3750, 3.9075 7.3750, 3.9075 7.3805, 3.9020 7.3805, 3.9020 7.3750))', 4326),
  'SCHOOL',
  '22222222-2222-4222-8222-222222222222',
  now(),
  now()
)
on conflict (id) do update set
  name = excluded.name,
  boundary = excluded.boundary,
  visibility = excluded.visibility,
  updated_at = now();

insert into public.observations (
  id,
  organization_id,
  school_id,
  project_id,
  garden_id,
  observer_id,
  observation_type,
  common_name,
  scientific_name,
  notes,
  observed_at,
  location,
  coordinate_accuracy_m,
  verification_status,
  visibility,
  sensitivity_level,
  reviewed_by,
  reviewed_at,
  review_stage,
  teacher_review_notes,
  teacher_reviewed_by,
  teacher_reviewed_at,
  created_at,
  updated_at
)
values (
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  '55555555-5555-4555-8555-555555555555',
  'TREE',
  'African teak',
  'Milicia excelsa',
  'A mature specimen with a broad canopy and signs of healthy leaf cover. Pollinators were active around the lower branches during the morning survey.',
  now() - interval '2 days',
  public.st_setsrid(public.st_makepoint(3.9048, 7.3782), 4326),
  4.2,
  'VERIFIED',
  'SCHOOL',
  'STANDARD',
  '44444444-4444-4444-8444-444444444444',
  now() - interval '1 day',
  'CLOSED',
  'The observation is well documented and the species match is consistent with the field notes.',
  '22222222-2222-4222-8222-222222222222',
  now() - interval '1 day',
  now(),
  now()
),
(
  'ffffffff-ffff-4fff-8fff-ffffffffffff',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  '55555555-5555-4555-8555-555555555555',
  'POLLINATOR',
  'Monarch butterfly',
  'Danaus plexippus',
  'Observed resting on a flowering shrub near the school pond. Wing movement and flower visitation indicate active pollination behaviour during the warm part of the day.',
  now() - interval '5 hours',
  public.st_setsrid(public.st_makepoint(3.9055, 7.3790), 4326),
  3.8,
  'PENDING',
  'SCHOOL',
  'STANDARD',
  null,
  null,
  'TEACHER_REVIEW',
  null,
  null,
  null,
  now(),
  now()
)
on conflict (id) do update set
  common_name = excluded.common_name,
  scientific_name = excluded.scientific_name,
  notes = excluded.notes,
  verification_status = excluded.verification_status,
  visibility = excluded.visibility,
  sensitivity_level = excluded.sensitivity_level,
  updated_at = now();

insert into public.observation_media (id, observation_id, storage_path, content_type, size_bytes, sha256, moderation_status, created_at)
values (
  '11111111-1111-5111-8111-111111111111',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  'demo-user-1/observations/tree-001.jpg',
  'image/jpeg',
  128000,
  '1111111111111111111111111111111111111111111111111111111111111111',
  'APPROVED',
  now()
),
(
  '22222222-2222-5222-8222-222222222222',
  'ffffffff-ffff-4fff-8fff-ffffffffffff',
  'demo-user-1/observations/butterfly-001.jpg',
  'image/jpeg',
  142000,
  '2222222222222222222222222222222222222222222222222222222222222222',
  'PENDING',
  now()
)
on conflict (id) do nothing;

insert into public.identification_suggestions (id, observation_id, provider, model_version, scientific_name, common_name, confidence, raw_response, created_at)
values (
  '33333333-3333-5333-8333-333333333333',
  'ffffffff-ffff-4fff-8fff-ffffffffffff',
  'vision',
  'geo-mentor-v1',
  'Danaus plexippus',
  'Monarch butterfly',
  0.9245,
  '{"species":"Danaus plexippus","confidence":0.9245,"matched_to":"butterfly"}'::jsonb,
  now()
)
on conflict (id) do nothing;

insert into public.expert_reviews (id, observation_id, expert_id, decision, scientific_name, review_notes, created_at)
values (
  '44444444-4444-5444-8444-444444444444',
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  '44444444-4444-4444-8444-444444444444',
  'VERIFIED',
  'Milicia excelsa',
  'The species identification and evidence quality are consistent with the verified field record.',
  now() - interval '1 day'
)
on conflict (id) do update set
  decision = excluded.decision,
  scientific_name = excluded.scientific_name,
  review_notes = excluded.review_notes,
  created_at = public.expert_reviews.created_at;

insert into public.guardian_consents (
  id,
  organization_id,
  student_id,
  consent_version,
  consent_method,
  recorded_by,
  granted_at,
  created_at
)
values (
  '55555555-5555-5555-8555-555555555555',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '55555555-5555-4555-8555-555555555555',
  '2025.1',
  'DIGITAL',
  '22222222-2222-4222-8222-222222222222',
  now() - interval '12 days',
  now() - interval '12 days'
)
on conflict (id) do update set
  consent_version = excluded.consent_version,
  consent_method = excluded.consent_method,
  recorded_by = excluded.recorded_by,
  granted_at = excluded.granted_at;

insert into public.notifications (
  id,
  user_id,
  organization_id,
  observation_id,
  kind,
  title,
  body,
  read_at,
  created_at
)
values (
  '66666666-6666-4666-8666-666666666666',
  '55555555-5555-4555-8555-555555555555',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'ffffffff-ffff-4fff-8fff-ffffffffffff',
  'OBSERVATION_SENT_TO_EXPERT',
  'Your observation was sent to an expert',
  'A teacher reviewed your field submission and forwarded it to the expert queue for verification.',
  null,
  now() - interval '2 hours'
)
on conflict (id) do nothing;

insert into public.school_catalog (
  id,
  source,
  source_id,
  name,
  school_type,
  country_code,
  state_region,
  district_lga,
  city,
  location,
  confidence,
  source_updated_at,
  imported_at
)
values (
  '77777777-7777-4777-8777-777777777777',
  'PROGRAMME_IMPORT',
  'st-monica-academy-001',
  'St. Monica Academy',
  'SECONDARY',
  'NG',
  'Oyo',
  'Ibadan South-West',
  'Ibadan',
  public.st_setsrid(public.st_makepoint(3.9050, 7.3775), 4326),
  0.98,
  now() - interval '2 days',
  now()
)
on conflict (source, source_id) do update set
  name = excluded.name,
  school_type = excluded.school_type,
  country_code = excluded.country_code,
  state_region = excluded.state_region,
  district_lga = excluded.district_lga,
  city = excluded.city,
  location = excluded.location,
  confidence = excluded.confidence,
  source_updated_at = excluded.source_updated_at,
  imported_at = now();

insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata, occurred_at)
values
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'SEED_DEMO_DATA', 'organization', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '{"source":"migration:0018_seed_demo_data"}'::jsonb, now()),
  ('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'TEACHER_SUBMIT_TO_EXPERT', 'observation', 'ffffffff-ffff-4fff-8fff-ffffffffffff', '{"review_stage":"EXPERT_REVIEW"}'::jsonb, now());

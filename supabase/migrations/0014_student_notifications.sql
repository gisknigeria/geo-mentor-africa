create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  observation_id uuid references public.observations(id) on delete cascade,
  kind text not null check (kind in ('OBSERVATION_SENT_TO_EXPERT', 'OBSERVATION_NEEDS_CHANGES', 'OBSERVATION_REJECTED', 'OBSERVATION_VERIFIED')),
  title text not null check (char_length(title) between 2 and 160),
  body text not null check (char_length(body) between 2 and 1000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
alter table public.notifications enable row level security;

drop policy if exists notifications_read_own on public.notifications;
create policy notifications_read_own on public.notifications for select to authenticated using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, update on public.notifications to authenticated;
grant insert on public.notifications to authenticated;

create or replace function public.review_observation_as_teacher(
  target_observation uuid,
  teacher_decision text,
  review_notes text
)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  observation public.observations%rowtype;
  next_stage text;
  next_status public.verification_status;
  notification_kind text;
  notification_title text;
  notification_body text;
begin
  select * into observation from public.observations where id = target_observation and review_stage = 'TEACHER_REVIEW' for update;
  if observation.id is null then raise exception 'Observation is not awaiting teacher review'; end if;
  if not (private.has_org_role(observation.organization_id, array['SCHOOL_ADMIN','TEACHER']::public.app_role[]) or private.is_platform_admin()) then raise exception 'Verified teacher role required'; end if;
  if char_length(coalesce(trim(review_notes), '')) not between 3 and 1000 then raise exception 'Review notes must contain 3 to 1000 characters'; end if;

  if teacher_decision = 'SUBMIT_TO_EXPERT' then
    next_stage := 'EXPERT_REVIEW'; next_status := 'PENDING';
    notification_kind := 'OBSERVATION_SENT_TO_EXPERT'; notification_title := 'Your observation was sent to an expert'; notification_body := 'A teacher reviewed your observation and sent it to the expert validation queue.';
  elsif teacher_decision = 'NEEDS_CHANGES' then
    next_stage := 'STUDENT_REVISION'; next_status := 'NEEDS_CHANGES';
    notification_kind := 'OBSERVATION_NEEDS_CHANGES'; notification_title := 'Your observation needs changes'; notification_body := 'A teacher requested changes to your observation. Review the teacher feedback and update your submission.';
  elsif teacher_decision = 'REJECTED' then
    next_stage := 'CLOSED'; next_status := 'REJECTED';
    notification_kind := 'OBSERVATION_REJECTED'; notification_title := 'Your observation was rejected'; notification_body := 'A teacher rejected your observation. Open your records to review the feedback.';
  else raise exception 'Invalid teacher decision';
  end if;

  update public.observations set review_stage = next_stage, verification_status = next_status,
    teacher_review_notes = trim(review_notes), teacher_reviewed_by = auth.uid(), teacher_reviewed_at = now(), updated_at = now()
  where id = observation.id;
  insert into public.notifications (user_id, organization_id, observation_id, kind, title, body)
  values (observation.observer_id, observation.organization_id, observation.id, notification_kind, notification_title, notification_body);
  insert into public.audit_events (actor_id, organization_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), observation.organization_id, 'TEACHER_' || teacher_decision, 'observation', observation.id, jsonb_build_object('next_stage', next_stage));
  return jsonb_build_object('status', next_status, 'review_stage', next_stage);
end;
$$;

revoke all on function public.review_observation_as_teacher(uuid, text, text) from public;
grant execute on function public.review_observation_as_teacher(uuid, text, text) to authenticated;

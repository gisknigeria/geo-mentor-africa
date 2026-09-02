-- Create waiting list table for landing page registrations
create table if not exists public.waiting_list (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 5 and 254),
  full_name text not null check (char_length(full_name) between 2 and 254),
  organization text check (char_length(organization) <= 254),
  role text check (role in ('School', 'Mentor', 'Partner', 'Other')),
  country text check (char_length(country) <= 100),
  message text check (char_length(message) <= 1000),
  interested_in text[] default array[]::text[],
  status text not null default 'PENDING' check (status in ('PENDING', 'CONFIRMED', 'OPTED_OUT')),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Create indexes for common queries
create index if not exists waiting_list_email_idx on public.waiting_list(email);
create index if not exists waiting_list_status_created_idx on public.waiting_list(status, created_at);
create index if not exists waiting_list_role_idx on public.waiting_list(role);

-- Enable RLS
alter table public.waiting_list enable row level security;

-- Policies
create policy waiting_list_insert_anonymous on public.waiting_list
  for insert
  with check (true);

create policy waiting_list_read_own_or_admin on public.waiting_list
  for select
  using (
    auth.uid() is null or 
    (auth.jwt() ->> 'role' = 'authenticated' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  );

-- Trigger for updated_at
create or replace function update_waiting_list_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger waiting_list_updated_at_trigger
  before update on public.waiting_list
  for each row
  execute function update_waiting_list_updated_at();

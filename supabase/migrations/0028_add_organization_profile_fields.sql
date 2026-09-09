-- Store separate organization address and organization profile links.
alter table public.waiting_list
  add column if not exists organization_address text check (char_length(organization_address) <= 500),
  add column if not exists organization_website text check (char_length(organization_website) <= 500);
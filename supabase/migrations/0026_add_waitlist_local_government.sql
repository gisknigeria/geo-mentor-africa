alter table public.waiting_list
  add column if not exists local_government text check (char_length(local_government) <= 150);
alter table public.waiting_list
  add column if not exists professional_prefix text check (char_length(professional_prefix) <= 30);
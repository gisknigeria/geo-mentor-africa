alter table public.waiting_list
  drop constraint if exists waiting_list_professional_field_check;

alter table public.waiting_list
  add constraint waiting_list_professional_field_check
  check (char_length(professional_field) <= 3000);
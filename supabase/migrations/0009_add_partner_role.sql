-- Add the third top-level platform role. Keep this enum change in its own
-- migration so PostgreSQL can commit the new value before dependent objects use it.
alter type public.app_role add value if not exists 'PARTNER';

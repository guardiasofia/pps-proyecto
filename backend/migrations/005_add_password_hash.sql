BEGIN;

ALTER TABLE public.usuarios
    ADD COLUMN IF NOT EXISTS password_hash text;

COMMIT;

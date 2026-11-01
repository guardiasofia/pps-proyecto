ALTER TABLE public.solicitudes
    ADD COLUMN IF NOT EXISTS rechazado_por character varying(100),
    ADD COLUMN IF NOT EXISTS motivo_rechazo text,
    ADD COLUMN IF NOT EXISTS rechazado_en timestamp with time zone;

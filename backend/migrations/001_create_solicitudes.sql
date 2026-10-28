CREATE TABLE IF NOT EXISTS public.solicitudes (
    id character varying(36) PRIMARY KEY,
    empleado_id integer NOT NULL REFERENCES public.empleados(legajo),
    tipo character varying(40) NOT NULL,
    estado character varying(20) NOT NULL DEFAULT 'pendiente',
    cambios jsonb NOT NULL,
    valores_anteriores jsonb,
    creado_en timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aprobado_por character varying(100),
    observacion text,
    aprobado_en timestamp with time zone
);

CREATE INDEX IF NOT EXISTS solicitudes_estado_creado_idx
    ON public.solicitudes (estado, creado_en);

ALTER TABLE public.familiares
    ADD COLUMN IF NOT EXISTS telefono character varying(50);

ALTER TABLE public.familiares
    ADD COLUMN IF NOT EXISTS tipo_documento character varying(20),
    ADD COLUMN IF NOT EXISTS numero_documento character varying(30),
    ADD COLUMN IF NOT EXISTS sexo character varying(10),
    ADD COLUMN IF NOT EXISTS fecha_nacimiento date;

ALTER TABLE public.solicitudes
    ADD COLUMN IF NOT EXISTS valores_anteriores jsonb;
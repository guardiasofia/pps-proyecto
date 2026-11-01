BEGIN;

CREATE TEMP TABLE funciones_normalizadas ON COMMIT DROP AS
WITH valores AS (
    SELECT
        idfuncion,
        btrim(translate(funcion, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')) AS nombre_sin_acentos
    FROM public.funciones
    WHERE funcion IS NOT NULL AND btrim(funcion) <> ''
),
normalizados AS (
    SELECT
        idfuncion,
        CASE lower(nombre_sin_acentos)
            WHEN 'gu?a tur?stico' THEN 'Guia Turistico'
            WHEN 'profesional inform?tico' THEN 'Profesional Informatico'
            WHEN 't?cnico en general' THEN 'Tecnico en general'
            ELSE nombre_sin_acentos
        END AS nombre_canonico
    FROM valores
)
SELECT
    idfuncion,
    min(idfuncion) OVER (PARTITION BY lower(nombre_canonico)) AS id_canonico,
    first_value(nombre_canonico) OVER (
        PARTITION BY lower(nombre_canonico)
        ORDER BY idfuncion
    ) AS nombre_canonico
FROM normalizados;

UPDATE public.empleados AS empleado
SET idfuncion = normalizada.id_canonico
FROM funciones_normalizadas AS normalizada
WHERE empleado.idfuncion = normalizada.idfuncion
  AND normalizada.idfuncion <> normalizada.id_canonico;

DELETE FROM public.funciones AS funcion
USING funciones_normalizadas AS normalizada
WHERE funcion.idfuncion = normalizada.idfuncion
  AND normalizada.idfuncion <> normalizada.id_canonico;

UPDATE public.funciones AS funcion
SET funcion = normalizada.nombre_canonico
FROM funciones_normalizadas AS normalizada
WHERE funcion.idfuncion = normalizada.id_canonico
  AND funcion.funcion IS DISTINCT FROM normalizada.nombre_canonico;

CREATE TEMP TABLE parentescos_normalizados ON COMMIT DROP AS
WITH valores AS (
    SELECT
        parentesco,
        btrim(translate(parentesco, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')) AS nombre_sin_acentos
    FROM public.parentesco
    WHERE parentesco IS NOT NULL AND btrim(parentesco) <> ''
),
normalizados AS (
    SELECT
        parentesco,
        CASE lower(nombre_sin_acentos)
            WHEN 'conyuge' THEN 'Conyuge'
            ELSE nombre_sin_acentos
        END AS nombre_canonico
    FROM valores
)
SELECT
    parentesco,
    min(parentesco) OVER (PARTITION BY lower(nombre_canonico)) AS parentesco_canonico,
    first_value(nombre_canonico) OVER (
        PARTITION BY lower(nombre_canonico)
        ORDER BY parentesco
    ) AS nombre_canonico
FROM normalizados;

UPDATE public.familiares AS familiar
SET parentesco = normalizado.parentesco_canonico
FROM parentescos_normalizados AS normalizado
WHERE familiar.parentesco = normalizado.parentesco
  AND normalizado.parentesco <> normalizado.parentesco_canonico;

DELETE FROM public.parentesco AS parentesco
USING parentescos_normalizados AS normalizado
WHERE parentesco.parentesco = normalizado.parentesco
  AND normalizado.parentesco <> normalizado.parentesco_canonico;

UPDATE public.parentesco AS parentesco
SET parentesco = normalizado.nombre_canonico
FROM parentescos_normalizados AS normalizado
WHERE parentesco.parentesco = normalizado.parentesco_canonico
  AND parentesco.parentesco IS DISTINCT FROM normalizado.nombre_canonico;

COMMIT;

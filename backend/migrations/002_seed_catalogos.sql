INSERT INTO public.reparticiones (idreparticion, nombre, estado, fechamod, usuariomod)
SELECT base.max_id + catalogo.orden, catalogo.nombre, 'AC', CURRENT_TIMESTAMP, 1
FROM (VALUES
    (1, 'CONCEJO DELIBERANTE'),
    (2, 'JUZGADO DE FALTAS'),
    (3, 'SECRETARIA DE COORDINACION DE GABINETE Y HACIENDA'),
    (4, 'SECRETARIA DE DESARROLLO HUMANO'),
    (5, 'SECRETARIA DE DESARROLLO PRODUCTIVO'),
    (6, 'SECRETARIA DE GOBIERNO'),
    (7, 'SECRETARIA DE OBRAS PUBLICAS'),
    (8, 'SECRETARIA DE SALUD'),
    (9, 'SECRETARIA DE SERVICIOS PUBLICOS')
) AS catalogo(orden, nombre)
CROSS JOIN (SELECT COALESCE(MAX(idreparticion), 0) AS max_id FROM public.reparticiones) AS base
WHERE NOT EXISTS (SELECT 1 FROM public.reparticiones WHERE nombre = catalogo.nombre);

INSERT INTO public.funciones (idfuncion, funcion, fechamod, usuariomod)
SELECT base.max_id + catalogo.orden, catalogo.nombre, CURRENT_TIMESTAMP, 1
FROM (VALUES
    (1, 'Administrativo'),
    (2, 'Operario'),
    (3, 'Maestranza'),
    (4, 'Chofer'),
    (5, 'Guardavida'),
    (6, 'Guardaparques'),
    (7, 'Guía Turístico'),
    (8, 'Inspector'),
    (9, 'Profesional de la Salud'),
    (10, 'Docente'),
    (11, 'Profesional Informático'),
    (12, 'Profesional en general'),
    (13, 'Técnico en general'),
    (14, 'Personal de Seguridad'),
    (15, 'Cajero'),
    (16, 'Juez'),
    (17, 'Fiscal'),
    (18, 'Concejal')
) AS catalogo(orden, nombre)
CROSS JOIN (SELECT COALESCE(MAX(idfuncion), 0) AS max_id FROM public.funciones) AS base
WHERE NOT EXISTS (SELECT 1 FROM public.funciones WHERE funcion = catalogo.nombre);

INSERT INTO public.parentesco (parentesco, fechamod, usuariomod)
SELECT vinculo.nombre, CURRENT_TIMESTAMP, 1
FROM (VALUES
    ('Cónyuge'),
    ('Hermano/a'),
    ('Abuelo/a'),
    ('Nieto/a'),
    ('Otro familiar'),
    ('Padre/Madre'),
    ('Hijo/a')
) AS vinculo(nombre)
WHERE NOT EXISTS (SELECT 1 FROM public.parentesco WHERE parentesco = vinculo.nombre);
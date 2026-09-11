--
-- PostgreSQL database dump
--

\restrict na4QPKK6h2UPSbPdYmO4Yda7wXf6eD1PgapUgeXQCMcuHr4gpftBCMNWdniVhAb

-- Dumped from database version 15.18 (Debian 15.18-1.pgdg13+1)
-- Dumped by pg_dump version 18.3

-- Started on 2026-09-09 01:37:50

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 849 (class 1247 OID 16482)
-- Name: estado_enum; Type: TYPE; Schema: public; Owner: pps_user
--

CREATE TYPE public.estado_enum AS ENUM (
    'AC',
    'BA'
);


ALTER TYPE public.estado_enum OWNER TO pps_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16502)
-- Name: archivos; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.archivos (
    idarchivo integer NOT NULL,
    contenido bytea,
    tipoarchivo character varying(100),
    nombrearchivo character varying(255),
    fechacarga date,
    estado public.estado_enum,
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.archivos OWNER TO pps_user;

--
-- TOC entry 223 (class 1259 OID 16568)
-- Name: direcciones; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.direcciones (
    legajo integer NOT NULL,
    calle character varying(255),
    callenro character varying(50),
    barrio character varying(255),
    ciudad character varying(255),
    provincia character varying(255),
    tel1 character varying(50),
    tel2 character varying(50),
    email character varying(255),
    f_actualiz date,
    estado public.estado_enum,
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.direcciones OWNER TO pps_user;

--
-- TOC entry 226 (class 1259 OID 16614)
-- Name: emp_cud; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.emp_cud (
    idcud integer NOT NULL,
    legajo integer,
    fechaemision date,
    fechavencimiento date,
    idarchivo integer,
    estado public.estado_enum,
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.emp_cud OWNER TO pps_user;

--
-- TOC entry 224 (class 1259 OID 16580)
-- Name: empestudios; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.empestudios (
    legajo integer NOT NULL,
    codestudio character varying(50) NOT NULL,
    titulo character varying(255),
    f_graduado date,
    institucion character varying(255),
    ciudad character varying(255),
    estado public.estado_enum,
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.empestudios OWNER TO pps_user;

--
-- TOC entry 221 (class 1259 OID 16531)
-- Name: empleados; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.empleados (
    legajo integer NOT NULL,
    apellido character varying(255),
    nombres character varying(255),
    nrodocumento character varying(50),
    f_nacimiento date,
    nacionalidad character varying(255),
    cuil character varying(50),
    estadocivil character varying(50),
    idfuncion integer,
    idreparticion integer,
    idarchivofoto integer,
    estado public.estado_enum,
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.empleados OWNER TO pps_user;

--
-- TOC entry 218 (class 1259 OID 16509)
-- Name: estudios; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.estudios (
    codestudio character varying(50) NOT NULL,
    estudio character varying(255),
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.estudios OWNER TO pps_user;

--
-- TOC entry 225 (class 1259 OID 16597)
-- Name: familiares; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.familiares (
    legajo integer NOT NULL,
    numfamiliar integer NOT NULL,
    apellido character varying(255),
    nombres character varying(255),
    parentesco character varying(50),
    discapacitado boolean,
    estado public.estado_enum,
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.familiares OWNER TO pps_user;

--
-- TOC entry 215 (class 1259 OID 16492)
-- Name: funciones; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.funciones (
    idfuncion integer NOT NULL,
    funcion character varying(255),
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.funciones OWNER TO pps_user;

--
-- TOC entry 219 (class 1259 OID 16514)
-- Name: parentesco; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.parentesco (
    parentesco character varying(50) NOT NULL,
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.parentesco OWNER TO pps_user;

--
-- TOC entry 216 (class 1259 OID 16497)
-- Name: reparticiones; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.reparticiones (
    idreparticion integer NOT NULL,
    nombre character varying(255),
    estado public.estado_enum,
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.reparticiones OWNER TO pps_user;

--
-- TOC entry 214 (class 1259 OID 16487)
-- Name: roles; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.roles (
    idrol integer NOT NULL,
    descripcion character varying(255)
);


ALTER TABLE public.roles OWNER TO pps_user;

--
-- TOC entry 220 (class 1259 OID 16519)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.usuarios (
    usucodigo integer NOT NULL,
    usunombre character varying(255),
    apenom character varying(255),
    idrol integer,
    estado public.estado_enum,
    email character varying(255),
    password_hash character varying(255),
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.usuarios OWNER TO pps_user;

--
-- TOC entry 222 (class 1259 OID 16553)
-- Name: usuarioslegajos; Type: TABLE; Schema: public; Owner: pps_user
--

CREATE TABLE public.usuarioslegajos (
    idusuariolegajo integer NOT NULL,
    usucodigo integer,
    legajo integer,
    estado public.estado_enum,
    fechamod timestamp without time zone,
    usuariomod integer
);


ALTER TABLE public.usuarioslegajos OWNER TO pps_user;

--
-- TOC entry 3497 (class 0 OID 16502)
-- Dependencies: 217
-- Data for Name: archivos; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.archivos (idarchivo, contenido, tipoarchivo, nombrearchivo, fechacarga, estado, fechamod, usuariomod) FROM stdin;
\.


--
-- TOC entry 3503 (class 0 OID 16568)
-- Dependencies: 223
-- Data for Name: direcciones; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.direcciones (legajo, calle, callenro, barrio, ciudad, provincia, tel1, tel2, email, f_actualiz, estado, fechamod, usuariomod) FROM stdin;
1001	San Martin	123	Centro	Córdoba	Córdoba	3511234567	3517654321	ana@gmail.com	2026-09-07	AC	2026-09-07 23:45:20.340662	1
\.


--
-- TOC entry 3506 (class 0 OID 16614)
-- Dependencies: 226
-- Data for Name: emp_cud; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.emp_cud (idcud, legajo, fechaemision, fechavencimiento, idarchivo, estado, fechamod, usuariomod) FROM stdin;
\.


--
-- TOC entry 3504 (class 0 OID 16580)
-- Dependencies: 224
-- Data for Name: empestudios; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.empestudios (legajo, codestudio, titulo, f_graduado, institucion, ciudad, estado, fechamod, usuariomod) FROM stdin;
1001	UNI	Licenciatura en Sistemas	2015-12-15	UNC	Córdoba	AC	2026-09-07 23:45:20.340662	1
\.


--
-- TOC entry 3501 (class 0 OID 16531)
-- Dependencies: 221
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.empleados (legajo, apellido, nombres, nrodocumento, f_nacimiento, nacionalidad, cuil, estadocivil, idfuncion, idreparticion, idarchivofoto, estado, fechamod, usuariomod) FROM stdin;
1001	Garcia	Ana	30123456	1990-05-14	Argentina	20-30123456-8	Soltera	1	1	\N	AC	2026-09-07 23:45:20.340662	1
\.


--
-- TOC entry 3498 (class 0 OID 16509)
-- Dependencies: 218
-- Data for Name: estudios; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.estudios (codestudio, estudio, fechamod, usuariomod) FROM stdin;
UNI	Universitario	2026-09-07 23:45:20.340662	1
SEC	Secundario	2026-09-07 23:45:20.340662	1
\.


--
-- TOC entry 3505 (class 0 OID 16597)
-- Dependencies: 225
-- Data for Name: familiares; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.familiares (legajo, numfamiliar, apellido, nombres, parentesco, discapacitado, estado, fechamod, usuariomod) FROM stdin;
1001	1	Garcia	María	Madre	f	AC	2026-09-07 23:45:20.340662	1
\.


--
-- TOC entry 3495 (class 0 OID 16492)
-- Dependencies: 215
-- Data for Name: funciones; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.funciones (idfuncion, funcion, fechamod, usuariomod) FROM stdin;
1	Analista de RRHH	2026-09-07 23:45:20.340662	1
2	Supervisor	2026-09-07 23:45:20.340662	1
\.


--
-- TOC entry 3499 (class 0 OID 16514)
-- Dependencies: 219
-- Data for Name: parentesco; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.parentesco (parentesco, fechamod, usuariomod) FROM stdin;
Madre	2026-09-07 23:45:20.340662	1
Padre	2026-09-07 23:45:20.340662	1
\.


--
-- TOC entry 3496 (class 0 OID 16497)
-- Dependencies: 216
-- Data for Name: reparticiones; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.reparticiones (idreparticion, nombre, estado, fechamod, usuariomod) FROM stdin;
1	Recursos Humanos	AC	2026-09-07 23:45:20.340662	1
2	Administracion	AC	2026-09-07 23:45:20.340662	1
\.


--
-- TOC entry 3494 (class 0 OID 16487)
-- Dependencies: 214
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.roles (idrol, descripcion) FROM stdin;
1	admin
2	empleado
\.


--
-- TOC entry 3500 (class 0 OID 16519)
-- Dependencies: 220
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.usuarios (usucodigo, usunombre, apenom, idrol, estado, email, fechamod, usuariomod) FROM stdin;
1	Admin	RRHH	1	AC	admin@pps.com	2026-09-07 23:45:20.340662	1
2	Ana	Garcia	2	AC	ana@pps.com	2026-09-07 23:45:20.340662	1
\.


--
-- TOC entry 3502 (class 0 OID 16553)
-- Dependencies: 222
-- Data for Name: usuarioslegajos; Type: TABLE DATA; Schema: public; Owner: pps_user
--

COPY public.usuarioslegajos (idusuariolegajo, usucodigo, legajo, estado, fechamod, usuariomod) FROM stdin;
1	2	1001	AC	2026-09-07 23:45:20.340662	1
\.


--
-- TOC entry 3320 (class 2606 OID 16508)
-- Name: archivos archivos_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.archivos
    ADD CONSTRAINT archivos_pkey PRIMARY KEY (idarchivo);


--
-- TOC entry 3332 (class 2606 OID 16574)
-- Name: direcciones direcciones_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_pkey PRIMARY KEY (legajo);


--
-- TOC entry 3338 (class 2606 OID 16618)
-- Name: emp_cud emp_cud_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.emp_cud
    ADD CONSTRAINT emp_cud_pkey PRIMARY KEY (idcud);


--
-- TOC entry 3334 (class 2606 OID 16586)
-- Name: empestudios empestudios_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.empestudios
    ADD CONSTRAINT empestudios_pkey PRIMARY KEY (legajo, codestudio);


--
-- TOC entry 3328 (class 2606 OID 16537)
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (legajo);


--
-- TOC entry 3322 (class 2606 OID 16513)
-- Name: estudios estudios_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.estudios
    ADD CONSTRAINT estudios_pkey PRIMARY KEY (codestudio);


--
-- TOC entry 3336 (class 2606 OID 16603)
-- Name: familiares familiares_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.familiares
    ADD CONSTRAINT familiares_pkey PRIMARY KEY (legajo, numfamiliar);


--
-- TOC entry 3316 (class 2606 OID 16496)
-- Name: funciones funciones_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.funciones
    ADD CONSTRAINT funciones_pkey PRIMARY KEY (idfuncion);


--
-- TOC entry 3324 (class 2606 OID 16518)
-- Name: parentesco parentesco_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.parentesco
    ADD CONSTRAINT parentesco_pkey PRIMARY KEY (parentesco);


--
-- TOC entry 3318 (class 2606 OID 16501)
-- Name: reparticiones reparticiones_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.reparticiones
    ADD CONSTRAINT reparticiones_pkey PRIMARY KEY (idreparticion);


--
-- TOC entry 3314 (class 2606 OID 16491)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (idrol);


--
-- TOC entry 3326 (class 2606 OID 16525)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usucodigo);


--
-- TOC entry 3330 (class 2606 OID 16557)
-- Name: usuarioslegajos usuarioslegajos_pkey; Type: CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.usuarioslegajos
    ADD CONSTRAINT usuarioslegajos_pkey PRIMARY KEY (idusuariolegajo);


--
-- TOC entry 3345 (class 2606 OID 16575)
-- Name: direcciones direcciones_legajo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_legajo_fkey FOREIGN KEY (legajo) REFERENCES public.empleados(legajo);


--
-- TOC entry 3350 (class 2606 OID 16624)
-- Name: emp_cud emp_cud_idarchivo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.emp_cud
    ADD CONSTRAINT emp_cud_idarchivo_fkey FOREIGN KEY (idarchivo) REFERENCES public.archivos(idarchivo);


--
-- TOC entry 3351 (class 2606 OID 16619)
-- Name: emp_cud emp_cud_legajo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.emp_cud
    ADD CONSTRAINT emp_cud_legajo_fkey FOREIGN KEY (legajo) REFERENCES public.empleados(legajo);


--
-- TOC entry 3346 (class 2606 OID 16592)
-- Name: empestudios empestudios_codestudio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.empestudios
    ADD CONSTRAINT empestudios_codestudio_fkey FOREIGN KEY (codestudio) REFERENCES public.estudios(codestudio);


--
-- TOC entry 3347 (class 2606 OID 16587)
-- Name: empestudios empestudios_legajo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.empestudios
    ADD CONSTRAINT empestudios_legajo_fkey FOREIGN KEY (legajo) REFERENCES public.empleados(legajo);


--
-- TOC entry 3340 (class 2606 OID 16548)
-- Name: empleados empleados_idarchivofoto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_idarchivofoto_fkey FOREIGN KEY (idarchivofoto) REFERENCES public.archivos(idarchivo);


--
-- TOC entry 3341 (class 2606 OID 16538)
-- Name: empleados empleados_idfuncion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_idfuncion_fkey FOREIGN KEY (idfuncion) REFERENCES public.funciones(idfuncion);


--
-- TOC entry 3342 (class 2606 OID 16543)
-- Name: empleados empleados_idreparticion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_idreparticion_fkey FOREIGN KEY (idreparticion) REFERENCES public.reparticiones(idreparticion);


--
-- TOC entry 3348 (class 2606 OID 16604)
-- Name: familiares familiares_legajo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.familiares
    ADD CONSTRAINT familiares_legajo_fkey FOREIGN KEY (legajo) REFERENCES public.empleados(legajo);


--
-- TOC entry 3349 (class 2606 OID 16609)
-- Name: familiares familiares_parentesco_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.familiares
    ADD CONSTRAINT familiares_parentesco_fkey FOREIGN KEY (parentesco) REFERENCES public.parentesco(parentesco);


--
-- TOC entry 3339 (class 2606 OID 16526)
-- Name: usuarios usuarios_idrol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_idrol_fkey FOREIGN KEY (idrol) REFERENCES public.roles(idrol);


--
-- TOC entry 3343 (class 2606 OID 16563)
-- Name: usuarioslegajos usuarioslegajos_legajo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.usuarioslegajos
    ADD CONSTRAINT usuarioslegajos_legajo_fkey FOREIGN KEY (legajo) REFERENCES public.empleados(legajo);


--
-- TOC entry 3344 (class 2606 OID 16558)
-- Name: usuarioslegajos usuarioslegajos_usucodigo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: pps_user
--

ALTER TABLE ONLY public.usuarioslegajos
    ADD CONSTRAINT usuarioslegajos_usucodigo_fkey FOREIGN KEY (usucodigo) REFERENCES public.usuarios(usucodigo);


-- Completed on 2026-09-09 01:37:50

--
-- PostgreSQL database dump complete
--

\unrestrict na4QPKK6h2UPSbPdYmO4Yda7wXf6eD1PgapUgeXQCMcuHr4gpftBCMNWdniVhAb


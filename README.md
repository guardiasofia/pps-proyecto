# PPS Concordia

Portal Angular y API NestJS para solicitudes de actualización de legajos, aprobación de RRHH e integración con PostgreSQL.

## Requisitos

- Node.js 22+ y npm.
- Docker Desktop con Docker Compose, o PostgreSQL 15.
- Proveedor de identidad externo que emita JWT firmados con `exp`.

## Iniciar

Desde la raíz, crear la base local:

```powershell
docker compose up -d postgres pgadmin
```

En un volumen nuevo, PostgreSQL ejecuta `pps_db.sql` y luego las migraciones de `backend/migrations`. Los init scripts no se vuelven a ejecutar sobre un volumen existente; respaldá datos y aplica las migraciones en orden para actualizar una base existente.

Configurar `backend/.env` usando `backend/.env.example` como referencia. En local, `DB_PASSWORD` debe coincidir con Compose (`change-me-local` por defecto). Se requiere `JWT_PUBLIC_KEY` (recomendado para RS256) o `JWT_SECRET` si el emisor usa HS256. No hay usuarios de prueba ni login/contraseñas locales; pedí un token al proveedor de identidad municipal. Cambiar todas las claves de desarrollo antes de cualquier uso compartido o productivo.

Arrancar API y portal en terminales separadas:

```powershell
cd backend
npm ci
npm run start:dev
```

```powershell
cd frontend
npm ci
npm start
```

El portal se sirve en `http://localhost:4200`; su proxy de desarrollo reenvía `/api` a `http://localhost:3000`. La API tiene `GET /api/health`. pgAdmin queda en `http://localhost:8080`, con credenciales locales configurables mediante `PGADMIN_DEFAULT_EMAIL` y `PGADMIN_DEFAULT_PASSWORD`. Los puertos de PostgreSQL y pgAdmin se enlazan a loopback.

## Seguridad

La API valida JWT con Passport, exige `exp` y limita la antigüedad máxima (`JWT_MAX_AGE`, una hora por defecto). CORS usa `CORS_ORIGINS`; la producción debe definirlo explícitamente. El token se mantiene en memoria durante la pestaña. Los archivos se limitan a 5 MiB y se comprueba su firma de formato antes de guardarlos en `bytea`; para volúmenes productivos, migrar a almacenamiento de objetos. El frontend es un shell de una sola pantalla, con guardas de autorización efectivas en la API; responsive no está verificado mediante pruebas visuales automatizadas.

## Verificar

```powershell
cd backend
npm test -- --testTimeout=15000
npm run test:e2e
npm run build
```

```powershell
cd frontend
npm run build
```

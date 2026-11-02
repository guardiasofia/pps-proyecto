# Backend — API de autogestión

API REST NestJS para la consulta de legajos, creación y resolución de solicitudes, y generación de reportes PDF.

## Requisitos

- Node.js 22 LTS recomendado y npm.
- PostgreSQL 15 local o accesible desde el backend.
- Un `JWT_SECRET` para login local HS256, o un par `JWT_PUBLIC_KEY`/`JWT_PRIVATE_KEY` para emitir JWT RS256.

## Inicio local

Desde la raíz, iniciar PostgreSQL:

```powershell
docker compose up -d postgres pgadmin
```

En un volumen nuevo, Compose ejecuta `pps_db.sql` y las migraciones SQL de `backend/migrations` en orden. Los scripts de inicialización no vuelven a ejecutarse sobre volúmenes existentes. En una base existente, aplicar `migrations/005_add_password_hash.sql` antes de iniciar la API.

Crear `backend/.env` manualmente; no hay `.env.example` en el repositorio. Ejemplo de desarrollo:

```dotenv
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=pps_user
DB_PASSWORD=pps_password
DB_NAME=pps_db
JWT_SECRET=definir-secreto-local
JWT_MAX_AGE=1h
CORS_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
JSON_BODY_LIMIT=8mb
```

Instalar y ejecutar:

```powershell
cd backend
npm ci
npm run auth:set-password
npm run start:dev
```

El segundo comando asigna una contraseña (mínimo 12 caracteres) a una única cuenta activa vinculada a un CUIL y guarda únicamente el hash scrypt. El frontend se inicia por separado desde `frontend/` con `npm ci` y `npm start`. La API escucha en `http://localhost:3000/api`; `GET /api/health` y `POST /api/auth/login` son públicos.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `JWT_PUBLIC_KEY` | Clave pública del emisor; preferida en producción. Si está definida, prevalece sobre `JWT_SECRET`. |
| `JWT_PRIVATE_KEY` | Clave privada correspondiente; requerida junto con `JWT_PUBLIC_KEY` para emitir tokens locales RS256. |
| `JWT_SECRET` | Secreto HS256. Requerido para emitir tokens de login en desarrollo y por los tokens locales de prueba. |
| `JWT_ALGORITHM` | Algoritmo(s) aceptados; predeterminado RS256 con clave pública o HS256 con secreto. |
| `JWT_MAX_AGE` | Antigüedad máxima del token; predeterminada `1h`. El token también debe incluir `exp`. |
| `CORS_ORIGINS` | Orígenes autorizados separados por coma; obligatorio en producción. |
| `PORT` | Puerto de la API; `3000` por defecto. |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Conexión a PostgreSQL. Valores locales predeterminados en `database.config.ts`; en producción se exigen host, usuario, contraseña y base. |
| `JSON_BODY_LIMIT` | Límite del cuerpo JSON; `8mb` por defecto. |
| `NODE_ENV` | Con `production` se aplican las comprobaciones productivas de configuración. |

`POST /api/auth/login` autentica contra cuentas activas vinculadas a empleados por `usuarioslegajos`; el usuario ingresa su CUIL y contraseña. La contraseña se compara contra `usuarios.password_hash` y se almacena como hash scrypt. No hay alta, cambio ni recuperación de contraseña en el portal. El script `scripts/dev-token.mjs` conserva `npm run token:rrhh`, `npm run token:empleado` y `npm run token:ana` para pruebas locales; solo genera JWT HS256 con `JWT_SECRET` y rechaza `NODE_ENV=production`.

El CUIL admite dígitos con o sin puntos, espacios o guiones; se valida el formato de 11 dígitos, no el dígito verificador ni la identidad real. Los nombres visibles se toman de `usuarios.usunombre` y `usuarios.apenom`. `pps_db.sql` no se actualiza al modificar pgAdmin: aplicar las migraciones en cada base y asignar las claves localmente. No guardar CUIL ni contraseñas en Git.

## Compilación y pruebas

```powershell
npm run build
npm test
npm run test:e2e
```

La API aplica cambios de legajo únicamente al aprobar una solicitud de RRHH. Los archivos se validan en el flujo de solicitudes, tienen un máximo de 5 MiB y se almacenan en PostgreSQL (`bytea`).

Para el despliegue integrado, variables completas, endpoints y diagramas, consultar [la guía principal](../README.md) y [la documentación de despliegue](../docs/DESPLIEGUE.md).

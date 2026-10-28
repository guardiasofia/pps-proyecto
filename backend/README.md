# PPS Concordia: backend

API NestJS para solicitudes de actualización de legajos y gestión de RRHH con PostgreSQL.

## Inicio local

Requisitos: Node.js 22+, npm, Docker Compose o PostgreSQL 15 y acceso al proveedor de identidad municipal.

Desde la raíz, crear la base:

```powershell
docker compose up -d postgres pgadmin
```

En una base nueva, Docker ejecuta `pps_db.sql` y después `migrations/`. Los scripts de init solo se ejecutan al crear un volumen vacío. En una base existente, hacer backup y aplicar las migraciones SQL en orden.

Copiar `.env.example` a `.env`, configurar JWT externo y DB, luego:

```powershell
cd backend
npm ci
npm run start:dev
```

En otra terminal, arrancar Angular:

```powershell
cd frontend
npm ci
npm start
```

Frontend: `http://localhost:4200`; su proxy `/api` reenvía a `http://localhost:3000`. Health: `GET /api/health`. pgAdmin: `http://localhost:8080`, en loopback.

## Variables

`backend/.env` se carga al iniciar el API. Nunca guardar secretos reales en Git.

| Variable | Descripción | Predeterminado |
| --- | --- | --- |
| `JWT_PUBLIC_KEY` | PEM del emisor, recomendado con RS256 | Ninguno |
| `JWT_SECRET` | Secreto externo, solo para HS256 | Ninguno |
| `JWT_ALGORITHM` | Algoritmos permitidos; inferido como RS256/HS256 si se omite | Según clave |
| `JWT_MAX_AGE` | Antigüedad máxima del token; requiere claim `exp` | `1h` |
| `CORS_ORIGINS` | Orígenes autorizados, separados por coma | Localhost y 127.0.0.1:4200; obligatorio en producción |
| `PORT` | Puerto HTTP | `3000` |
| `DB_HOST` / `DB_PORT` | Servidor/puerto PostgreSQL | `localhost` / `5432` |
| `DB_USERNAME` / `DB_PASSWORD` / `DB_NAME` | Credenciales y nombre de base | `pps_user`, `change-me-local`, `pps_db` en Compose; obligatorios en producción |
| `JSON_BODY_LIMIT` | Límite de JSON para archivos del prototipo | `8mb` |

No hay alta local de usuarios, validación de contraseñas ni emisión de JWT. Pedir un token al proveedor municipal; no se incluyen usuarios de prueba.

## Alcance y verificaciones

`/empleados` es de solo lectura. Los cambios se guardan como solicitudes y se aplican al aprobarse. Los archivos se verifican por firma, se limitan a 5 MiB y se almacenan en `bytea`; es una solución de prototipo, no escalable para grandes volúmenes. El token del usuario vive en memoria durante la pestaña.

```powershell
npm test -- --testTimeout=15000
npm run test:e2e
npm run build
```

El e2e del health check no requiere base de datos; los tests de persistencia usan mocks.
# Backend

La API no crea cuentas ni valida contraseñas. El cliente recibe un JWT del proveedor de identidad municipal y lo valida contra `GET /api/auth/profile`.

Configurar una de estas variables antes de iniciar el backend:

- `JWT_PUBLIC_KEY`: clave pública PEM del emisor (recomendado para RS256).
- `JWT_SECRET`: secreto compartido únicamente si el emisor firma con HS256.

`JWT_ALGORITHM` permite fijar los algoritmos aceptados; el valor predeterminado es `RS256` con `JWT_PUBLIC_KEY` y `HS256` con `JWT_SECRET`. `JWT_MAX_AGE` limita la antigüedad máxima del token y por defecto es `1h`. Los tokens deben contener `exp`. No se incluye una clave predeterminada.

El directorio de empleados es de solo lectura. Las modificaciones de legajo se canalizan mediante solicitudes y se aplican únicamente al aprobarlas desde RRHH. Los reportes se generan para solicitudes y pueden consultarse en estado pendiente o histórico.

En una base nueva, Docker Compose carga `pps_db.sql` y después las migraciones/semillas desde `backend/migrations`. Los scripts de `/docker-entrypoint-initdb.d` solo se ejecutan al inicializar un volumen de PostgreSQL vacío.
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

 # PPS Concordia: backend

 API NestJS para la gestión de solicitudes de actualización de legajos. PostgreSQL conserva empleados, solicitudes, catálogos y archivos. RRHH consulta y aprueba solicitudes; no existen operaciones de escritura directa sobre `/empleados`.

 ## Requisitos

 - Node.js 22 o superior y npm.
 - Docker Desktop con Docker Compose, o PostgreSQL 15 accesible.
 - Un proveedor de identidad externo que emita JWT firmados con `exp` y los claims de usuario/rol requeridos.

 ## Puesta en marcha

 Desde la raíz del repositorio, iniciar PostgreSQL y pgAdmin:

 ```powershell
 docker compose up -d postgres pgadmin
 ```

 En una base nueva, el contenedor carga `pps_db.sql` y los scripts de `backend/migrations` al crear el volumen. Los scripts de init solo corren con un volumen vacío. Para conservar datos existentes, respaldar la base y aplicar las migraciones SQL en orden desde pgAdmin o `psql`.

 Instalar dependencias y arrancar el backend:

 ```powershell
 cd backend
 npm ci
 npm run start:dev
 ```

 En otra terminal, instalar y arrancar el frontend:

 ```powershell
 cd frontend
 npm ci
 npm start
 ```

 Angular sirve la interfaz en `http://localhost:4200` y reenvía `/api` al backend en el puerto 3000 mediante `src/proxy.conf.json`. El endpoint de comprobación es `GET /api/health`.

 ## Configuración

 Configurar estas variables en el entorno del proceso backend. No guardar claves privadas ni secretos en el repositorio.

 | Variable | Uso | Predeterminado |
 | --- | --- | --- |
 | `JWT_PUBLIC_KEY` | Clave pública PEM del emisor, recomendado con RS256 | Sin valor |
 | `JWT_SECRET` | Secreto compartido solo si el emisor usa HS256 | Sin valor |
 | `JWT_ALGORITHM` | Algoritmos de firma permitidos | `RS256` con clave pública; `HS256` con secreto |
 | `JWT_MAX_AGE` | Antigüedad máxima del token | `1h` |
 | `CORS_ORIGINS` | Orígenes web separados por coma | `http://localhost:4200` |
 | `PORT` | Puerto del API | `3000` |
 | `DB_HOST` | Servidor PostgreSQL | `localhost` |
 | `DB_PORT` | Puerto PostgreSQL | `5432` |
 | `DB_USERNAME` | Usuario de base | `pps_user` |
 | `DB_PASSWORD` | Clave de base | `pps_password` |
 | `DB_NAME` | Nombre de base | `pps_db` |
 | `JSON_BODY_LIMIT` | Límite de payload JSON | `8mb` |

 El backend no crea usuarios ni valida contraseñas, y no emite JWT. El frontend acepta un token emitido por el proveedor externo, lo valida con `GET /api/auth/profile` y lo conserva solo en memoria durante la pestaña. Los tokens deben incluir `exp`; Passport rechaza vencidos y limita su antigüedad con `JWT_MAX_AGE`.

 Los archivos de foto/CUD se aceptan hasta 5 MiB y se verifican por firma básica de formato antes de guardarlos como `bytea`. Esta estrategia es adecuada para el prototipo; para producción con volumen de archivos, trasladar almacenamiento a object storage.

 ## API principal

 - `GET /api/health`: estado del servicio.
 - `GET /api/auth/profile`: validar token y devolver identidad normalizada.
 - `GET /api/empleados/me`: ficha vinculada al usuario.
 - `GET /api/empleados`: listado de RRHH, solo lectura.
 - `GET /api/solicitudes/catalogos`: funciones, reparticiones, estados civiles y parentescos disponibles.
 - `POST /api/solicitudes`: crear una solicitud con uno o varios cambios.
 - `GET /api/solicitudes`: bandeja pendiente de RRHH; `?estado=all` incluye el historial.
 - `PATCH /api/solicitudes/:id/aprobar`: aplicar los cambios y aprobarlos en una transacción.
 - `GET /api/reportes/solicitud/:id/pdf`: reporte PDF visible/imprimible.

 ## Pruebas y compilación

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

 El e2e del health check usa un módulo aislado y no requiere PostgreSQL. Las pruebas de lógica usan mocks; ejecutar una prueba de integración con PostgreSQL requiere levantar el servicio y aplicar migraciones.

```bash
$ npm install
```

# production mode
$ npm run start:prod
```

## Run tests


# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
[NestJS Observe](https://observe.nestjs.com) automatically instruments your NestJS application, giving you deep visibility into your system with minimal setup:

- **Distributed tracing:** Follow requests across services and understand how they flow through your system.
- **Waterfall analysis:** Visualize request execution and identify slow operations, bottlenecks, and unexpected delays.
- **Performance analysis:** Analyze application performance in real time and quickly pinpoint areas that need optimization.
- **Metrics:** Track key application and infrastructure metrics to understand system health and performance trends.
- **Logging:** Centralize and correlate logs with traces and other telemetry to make debugging easier.
- **Error tracking:** Detect errors quickly and investigate their root causes with the surrounding context.
- **SLA monitoring:** Track service-level objectives and identify when your application is approaching or exceeding defined thresholds.
- **Alarms and alerts:** Set up alerts for critical errors, performance degradation, SLA violations, and other anomalies so your team can react quickly.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Auto-instrument your application with [NestJS Observer](https://observer.nestjs.com). Distributed tracing, metrics, and logging made easy. Error tracking and performance monitoring for your NestJS applications.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

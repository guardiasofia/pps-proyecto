# Capturas y diagramas

## Capturas recibidas e incorporadas

Las imágenes siguientes se copiaron desde los adjuntos recibidos a `docs/img/`. Las rutas son relativas a este documento.

| Archivo | Título | Descripción | Ubicación recomendada |
|---|---|---|---|
| `img/login.png` | Ingreso al sistema | Formulario actual de CUIL y contraseña, con los campos vacíos para no revelar credenciales. | README, Manual de usuario → Acceso al sistema. |
| `img/login-error.png` | Acceso rechazado | Mensaje genérico de error con los campos de ingreso ocultos. | Manual de usuario → Acceso al sistema. |
| `img/inicio-empleado.png` | Inicio del portal del empleado | Inicio con bienvenida, botón Nueva solicitud y aviso sobre presentaciones pendientes. | README, Manual → Navegación principal / Empleado. |
| `img/ficha-empleado.png` | Ficha personal y cuenta vinculada | Datos de ficha, cuenta, contacto y familiares registrados. | Manual → Navegación principal / Empleado. |
| `img/resumen-rrhh.png` | Resumen de gestión de RRHH | Indicadores, últimas solicitudes y distribución del personal por repartición. | README, Manual → Navegación principal / Recursos Humanos. |
| `img/solicitudes-rrhh.png` | Bandeja de solicitudes | Cambios pendientes con acciones de aprobar y rechazar. | Manual → Gestión de solicitudes. |
| `img/reportes-rrhh.png` | Exportar solicitud | Selector de solicitud y acción de exportación/imprimir PDF. | Manual → Listados y reportes. |
| `img/reporte-panel.png` | Panel de exportación | Tarjeta de RRHH para seleccionar una solicitud y generar el PDF. | Manual → Listados y reportes. |
| `img/reporte-solicitud.png` | Ejemplo de reporte PDF | Ejemplo de documento con estado, legajo y datos actuales/solicitados. | Manual → Listados y reportes. |
| `img/backend-corriendo.png` | Backend iniciado | Consola con NestJS, módulos y rutas cargados. | Guía de despliegue → Backend / Verificación. |
| `img/frontend-corriendo.png` | Frontend iniciado | Consola con Angular en modo watch y dirección local. | Guía de despliegue → Frontend / Verificación. |
| `img/docker-containers.png` | Contenedores de desarrollo | Docker Desktop con PostgreSQL y pgAdmin en ejecución. | README, Guía de despliegue → Docker. |
| `img/nueva-solicitud.png` | Formulario de nueva solicitud | Formulario con el campo Domicilio seleccionado. | Manual → Gestión de solicitudes. |
| `img/selector-dato.png` | Selector de dato | Menú con los tipos de actualización disponibles. | Manual → Formularios. |
| `img/formulario-familiar.png` | Datos de familiar | Campos de parentesco, documento y contacto con valores ficticios. | Manual → Formularios. |
| `img/cambios-acumulados.png` | Cambios incluidos | Lista previa al envío con datos ficticios de ejemplo. | Manual → Gestión de solicitudes. |
| `img/directorio-personal.png` | Directorio de personal | Listado del área de RRHH con personas ficticias. | Manual → Listados y reportes. |
| `img/directorio-filtrado.png` | Búsqueda en el directorio | Resultado filtrado con nombre ficticio de ejemplo. | Manual → Listados y reportes. |
| `img/reporte-selector.png` | Selección de reporte | Opciones del selector de reportes con identidades ficticias. | Manual → Listados y reportes. |
| `img/reporte-generado.png` | PDF de solicitud generado | Documento abierto con datos ficticios de ejemplo. | Manual → Listados y reportes. |
| `img/rechazo-motivo.png` | Rechazo de solicitud | Modal para escribir un motivo antes de confirmar. | Manual → Gestión de solicitudes. |
| `img/rechazo-confirmado.png` | Rechazo con motivo ingresado | Modal con motivo y datos ficticios de solicitud. | Manual → Gestión de solicitudes. |
| `img/bandeja-rrhh.png` | Bandeja de solicitudes de RRHH | Solicitudes pendientes con nombres e identificadores ficticios. | Manual → Gestión de solicitudes. |

### Datos de las capturas

Las capturas actuales del login se recortaron para quitar la barra del navegador y se vaciaron los campos de usuario y contraseña antes de incorporarlas. La captura de la consola usada para asignar contraseñas no se publicó porque mostraba un CUIL. No incluir en el repositorio CUIL reales, contraseñas, hashes ni tokens; las credenciales de prueba que se hayan divulgado deben cambiarse.

## Capturas sugeridas, todavía no disponibles

| Nombre sugerido | Título | Qué debería mostrar | Sección |
|---|---|---|---|
| `img/validacion-formulario.png` | Validación de formulario | Mensaje al ingresar datos inválidos o adjuntar un archivo no admitido. | Manual → Validaciones y mensajes. |

## Diagramas Mermaid

Los diagramas editables completos están en [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md):

- Arquitectura general.
- Componentes Angular/NestJS/PostgreSQL.
- Secuencia de login con JWT.
- Flujo de solicitud desde creación hasta aprobación/rechazo y persistencia.
- Interacción frontend, backend, guards y base de datos.
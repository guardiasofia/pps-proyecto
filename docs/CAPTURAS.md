# Capturas y diagramas

## Capturas recibidas e incorporadas

Las imágenes siguientes se copiaron desde los adjuntos recibidos a `docs/img/`. Las rutas son relativas a este documento.

| Archivo | Título | Descripción | Ubicación recomendada |
|---|---|---|---|
| `img/login.png` | Ingreso al sistema | Formulario para validar un token de acceso externo. | README, Manual de usuario → Acceso al sistema. |
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

Los nombres, correos, legajos, fechas, identificadores y motivos visibles en las capturas del sistema son ficticios, inventados para demostración y no corresponden a personas reales. Se conservaron las imágenes originales; únicamente se cubrió la ruta local que identificaba al usuario del equipo en `img/frontend-corriendo.png`. Las capturas que mostraban JWT completos se excluyeron porque los tokens son credenciales.

## Capturas sugeridas, todavía no disponibles

| Nombre sugerido | Título | Qué debería mostrar | Sección |
|---|---|---|---|
| `img/validacion-formulario.png` | Validación de formulario | Mensaje al ingresar datos inválidos o adjuntar un archivo no admitido. | Manual → Validaciones y mensajes. |

Para ilustrar el cierre de sesión puede volver a capturarse `img/login.png` inmediatamente después de seleccionar **Salir**.

## Diagramas Mermaid

Los diagramas editables completos están en [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md):

- Arquitectura general.
- Componentes Angular/NestJS/PostgreSQL.
- Secuencia de login con JWT.
- Flujo de solicitud desde creación hasta aprobación/rechazo y persistencia.
- Interacción frontend, backend, guards y base de datos.
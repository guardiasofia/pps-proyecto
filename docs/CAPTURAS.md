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
| `img/reporte-solicitud.png` | Ejemplo de reporte PDF | Ejemplo de documento con estado, legajo y datos actuales/solicitados. | Manual → Listados y reportes. |

### Privacidad antes de la entrega

Las capturas visibles contienen datos personales de ejemplo. Anonimizar nombres, identificadores, DNI, correo y demás información personal antes de subir el repositorio a un espacio público o entregarlo a terceros. Mantener sin cambios los archivos originales fuera del repositorio si se necesita conservarlos.

La imagen adjunta bajo el nombre `Ventana-Personal-RRHH.png` visualmente duplica la vista de exportación de Reportes; por eso no se añadió una segunda copia ni se presenta como captura del directorio Personal.

## Capturas sugeridas, todavía no disponibles

| Nombre sugerido | Título | Qué debería mostrar | Sección |
|---|---|---|---|
| `img/formulario-solicitud.png` | Formulario de nueva solicitud | Selector del dato, controles del campo y validación visible. Usar datos anonimizados. | Manual → Formularios. |
| `img/solicitud-lista-para-enviar.png` | Revisión de cambios antes del envío | Dos o más cambios en lista temporal y botón de envío completo. | Manual → Gestión de solicitudes. |
| `img/rechazo-con-motivo.png` | Rechazo con motivo | Modal de RRHH con motivo ingresado y contador de caracteres. | Manual → Gestión de solicitudes. |
| `img/directorio-personal.png` | Directorio de personal | Tabla de personal y búsqueda por nombre/área. | Manual → Listados y reportes. |
| `img/validacion-formulario.png` | Validación de formulario | Mensaje al ingresar datos inválidos o adjuntar un archivo no admitido. | Manual → Validaciones y mensajes. |
| `img/docker-containers.png` | Servicios de desarrollo en Docker | `postgres` y `pgadmin` ejecutándose en Docker Desktop o en salida de `docker compose ps`; no mostrar contraseñas. | README o Guía de despliegue → Docker. |

Para ilustrar el cierre de sesión puede volver a capturarse `img/login.png` inmediatamente después de seleccionar **Salir**.

La captura del formulario y del directorio sería útil para documentar rutas que el usuario realiza y que no están representadas en las imágenes recibidas.

## Diagramas Mermaid

Los diagramas editables completos están en [DOCUMENTACION_TECNICA.md](DOCUMENTACION_TECNICA.md):

- Arquitectura general.
- Componentes Angular/NestJS/PostgreSQL.
- Secuencia de login con JWT.
- Flujo de solicitud desde creación hasta aprobación/rechazo y persistencia.
- Interacción frontend, backend, guards y base de datos.

Se recomienda conservar los diagramas Mermaid en Markdown para revisión/versionado. Si la institución requiere PDF, exportar la documentación completa desde un renderizador Markdown compatible con Mermaid después de anonimizar las capturas; el PDF es un formato de entrega adicional, no el documento fuente.

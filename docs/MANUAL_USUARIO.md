# Manual de usuario

## Introducción

El portal permite al personal municipal consultar los datos asociados a su legajo y presentar una solicitud de actualización. Recursos Humanos dispone de un panel para consultar personal, revisar cambios, resolver solicitudes y generar reportes PDF.

La aplicación usa un token emitido por un proveedor de identidad externo. No se crea una contraseña desde este portal.

## Acceso al sistema

1. Abrir la dirección web comunicada por el administrador.
2. Solicitar al proveedor de identidad institucional un token vigente.
3. Pegar el token en el campo **Token de acceso externo** y seleccionar **Validar token**.
4. Si el token es válido, se abre el inicio correspondiente al rol. Si no lo es o expiró, solicitar uno vigente.

La captura existente muestra el formulario de ingreso con el campo para pegar el token.

**Captura sugerida:** `docs/img/login.png`<br>
**Qué muestra:** pantalla de acceso y validación de un token externo.<br>
**Flujo:** obtener token → pegarlo → validarlo → acceder al portal según el rol.

![Pantalla de ingreso](img/login.png)

## Navegación principal

### Empleado

El menú presenta **Inicio**. La pantalla contiene el acceso a **Autogestión de datos**, la ficha personal, la cuenta vinculada, domicilio/contacto, familiares, estudios y CUD cuando están disponibles.

**Captura sugerida:** `docs/img/inicio-empleado.png`<br>
**Qué muestra:** bienvenida, acción para iniciar una solicitud y aviso informativo sobre presentaciones pendientes.<br>
**Flujo:** ingresar como empleado → revisar la ficha → abrir **Nueva solicitud** para pedir cambios.

![Inicio del empleado](img/inicio-empleado.png)

La ficha presentada es de consulta. La captura disponible de la ficha permite ilustrar los datos visibles.

**Captura sugerida:** `docs/img/ficha-empleado.png`<br>
**Qué muestra:** ficha personal y cuenta de acceso, además de datos de domicilio, contacto y familiares.<br>
**Flujo:** entrar en Inicio → desplazarse por las tarjetas → verificar los datos actuales antes de solicitar una actualización.

![Ficha personal](img/ficha-empleado.png)

### Recursos Humanos

El menú presenta **Resumen**, **Solicitudes**, **Personal** y **Reportes**.

**Captura sugerida:** `docs/img/resumen-rrhh.png`<br>
**Qué muestra:** indicadores de personal activo, solicitudes abiertas, distribución por repartición y actividad reciente.<br>
**Flujo:** ingresar con rol RRHH → revisar indicadores → seleccionar la sección del menú que corresponda.

![Resumen de RRHH](img/resumen-rrhh.png)

**Captura sugerida:** `docs/img/solicitudes-rrhh.png`<br>
**Qué muestra:** bandeja de solicitudes pendientes con los cambios solicitados y acciones de aprobación/rechazo.<br>
**Flujo:** abrir **Solicitudes** → revisar los valores actuales y solicitados → aprobar o iniciar el rechazo indicando motivo.

![Bandeja de solicitudes](img/solicitudes-rrhh.png)

![Bandeja adicional de RRHH](img/bandeja-rrhh.png)

La vista **Personal** muestra el directorio y un filtro por nombre/apellido. Seleccionar **Reportes** permite elegir una solicitud y abrir su PDF.

**Captura sugerida:** `docs/img/directorio-personal.png` y `docs/img/directorio-filtrado.png`<br>
**Qué muestran:** directorio general y resultado de búsqueda; los nombres se ocultaron.<br>
**Flujo:** abrir **Personal** → escribir un nombre o área → revisar las filas coincidentes.

![Directorio de personal](img/directorio-personal.png)

![Directorio filtrado](img/directorio-filtrado.png)

**Captura sugerida:** `docs/img/reportes-rrhh.png`<br>
**Qué muestra:** selección de solicitud y acción para exportar/imprimir PDF.<br>
**Flujo:** abrir **Reportes** → seleccionar una solicitud → elegir **Exportar / imprimir PDF** → permitir la ventana emergente del navegador.

![Exportación de reportes](img/reportes-rrhh.png)

![Panel de exportación](img/reporte-panel.png)

**Captura sugerida:** `docs/img/reporte-selector.png`<br>
**Qué muestra:** el selector desplegado con solicitudes de ejemplo e identificadores ficticios.<br>
**Flujo:** abrir Reportes → desplegar la lista → elegir la solicitud que se desea imprimir.

![Selector de solicitud para exportar](img/reporte-selector.png)

**Captura sugerida:** `docs/img/reporte-generado.png`<br>
**Qué muestra:** el PDF abierto con datos ficticios de una solicitud de ejemplo.<br>
**Flujo:** elegir una solicitud → exportar/imprimir → revisar el documento generado.

![PDF generado](img/reporte-generado.png)

## Gestión de solicitudes

### Crear una solicitud como empleado

1. En **Inicio**, seleccionar **Nueva solicitud**.
2. Elegir un dato en **Dato a modificar**.
3. Completar el valor o los campos requeridos.
4. Presionar **Agregar dato**. El cambio pasa a la lista temporal de datos incluidos; todavía no fue enviado.
5. Repetir para incorporar otros campos. Se pueden enviar varios cambios juntos. El mismo campo no puede agregarse dos veces a la solicitud en preparación; los familiares se agregan como una lista.
6. Revisar la lista; quitar un cambio si hace falta.
7. Seleccionar **Enviar solicitud completa**.
8. Si la API valida y persiste la presentación, se cierra el formulario. La solicitud queda pendiente de revisión de RRHH.

Los campos disponibles son domicilio, teléfonos, email, repartición, estado civil, familiares, foto, función y CUD. Para CUD, indicar Sí requiere adjuntar certificado; indicar No no solicita archivo.

**Captura sugerida:** `docs/img/nueva-solicitud.png`<br>
**Qué muestra:** formulario de una solicitud nueva con Domicilio seleccionado.<br>
**Flujo:** abrir Nueva solicitud → elegir Domicilio → escribir el nuevo valor → agregarlo.

![Formulario de nueva solicitud](img/nueva-solicitud.png)

**Captura sugerida:** `docs/img/selector-dato.png`<br>
**Qué muestra:** las opciones de datos que pueden incluirse en una presentación.<br>
**Flujo:** abrir el selector → elegir el tipo de cambio → completar los campos que aparecen.

![Selector de dato a modificar](img/selector-dato.png)

**Captura sugerida:** `docs/img/formulario-familiar.png`<br>
**Qué muestra:** formulario de familiar con tipo de documento, sexo, parentesco y teléfono opcional.<br>
**Flujo:** elegir Familiares → completar los datos obligatorios → elegir parentesco del catálogo → agregar.

![Formulario de familiar](img/formulario-familiar.png)

**Captura sugerida:** `docs/img/cambios-acumulados.png`<br>
**Qué muestra:** más de un cambio reunido en la presentación antes del envío; los datos que aparecen son ficticios.<br>
**Flujo:** agregar cada campo → revisar el resumen → retirar un cambio si hace falta → enviar la solicitud completa.

![Cambios incluidos en una solicitud](img/cambios-acumulados.png)

**Captura sugerida (pendiente):** `docs/img/solicitud-lista-para-enviar.png`<br>
**Qué debería mostrar:** varios cambios acumulados y el botón de envío.<br>
**Flujo a capturar:** agregar datos → revisar/retirar un cambio → enviar la presentación completa.

### Revisar, aprobar o rechazar como RRHH

1. Abrir **Solicitudes**. La bandeja carga solicitudes pendientes.
2. Comparar cada dato actual con el valor solicitado, el legajo y el estado del empleado.
3. Para aprobar, presionar **Aprobar**. El sistema aplica los cambios al legajo y registra aprobador y fecha.
4. Para rechazar, presionar **Rechazar**, escribir un motivo no vacío (máximo 500 caracteres) y confirmar. El motivo queda guardado.
5. La lista se actualiza al finalizar la operación.

Una solicitud que ya no está pendiente no puede resolverse nuevamente desde los endpoints de aprobación/rechazo.

## Formularios

| Dato solicitado | Comportamiento y validación visible/servidor |
|---|---|
| Domicilio | Texto de al menos 5 caracteres y máximo 255. |
| Teléfono | Debe respetar el formato telefónico aceptado. |
| Teléfonos de contacto | Uno o dos teléfonos separados por coma. |
| Correo electrónico | Debe tener formato de email. |
| Repartición / función | Elegir un elemento de los catálogos cargados. |
| Estado civil | Elegir una opción del catálogo servido por la API. |
| Familiares | Completar apellido, nombre, tipo/número de documento, sexo, nacimiento y parentesco; teléfono opcional. Se valida contra el catálogo de parentescos. |
| Foto | JPG, PNG o WEBP; límite de 5 MB. |
| CUD | Responder Sí/No. Si Sí, adjuntar JPG, PNG, WEBP o PDF de hasta 5 MB. |

El servidor vuelve a validar los datos, los campos permitidos, los catálogos y la firma de formato de los adjuntos. Los mensajes de rechazo de la API aparecen en el formulario.

## Listados y reportes

- **Personal:** permite filtrar el directorio por nombre/apellido; en la interfaz el campo de búsqueda también presenta el área.
- **Solicitudes:** muestra las pendientes en la bandeja. La sección de reportes obtiene todos los estados.
- **Reportes:** genera un PDF con los datos del empleado, cambios solicitados y, cuando corresponde, observación de RRHH.
- **Ficha del empleado:** se consulta desde Inicio; no es una edición directa.

La imagen `docs/img/reporte-solicitud.png` es una página de ejemplo del PDF emitido.

**Captura sugerida:** `docs/img/reporte-solicitud.png`<br>
**Qué muestra:** identificador y estado de la presentación, legajo y valores actual/solicitado.<br>
**Flujo:** RRHH abre Reportes → elige la solicitud → solicita el PDF → visualiza/guarda/imprime el documento.

![Ejemplo de reporte de solicitud](img/reporte-solicitud.png)

## Validaciones y mensajes

- Un token ausente, inválido o expirado impide acceder.
- El rol RRHH es necesario para directorio, detalle/listado de solicitudes, resolución y PDF.
- Para crear solicitudes, la identidad debe asociarse a un legajo activo.
- No se pueden enviar solicitudes sin cambios ni campos ajenos a la lista permitida.
- El backend evita solicitudes pendientes duplicadas para el mismo campo y legajo.
- Los errores de conexión, autorización y validación se notifican en pantalla; ante expiración o falta de autorización, volver a ingresar.
- El portal no presenta una sección de historial para que el empleado consulte el estado de solicitudes anteriores.

**Captura sugerida:** `docs/img/rechazo-motivo.png`<br>
**Qué muestra:** formulario de RRHH para escribir el motivo del rechazo.<br>
**Flujo:** seleccionar Rechazar → completar el motivo → confirmar la decisión.

![Formulario de rechazo](img/rechazo-motivo.png)

**Captura sugerida:** `docs/img/rechazo-confirmado.png`<br>
**Qué muestra:** rechazo con motivo ingresado y datos ficticios de ejemplo.<br>
**Flujo:** revisar el motivo escrito → confirmar el rechazo.

![Confirmación del rechazo](img/rechazo-confirmado.png)

**Captura sugerida (pendiente):** `docs/img/validacion-formulario.png`<br>
**Qué debería mostrar:** un mensaje visible de validación (por ejemplo, teléfono inválido o archivo de tipo/tamaño no admitido), sin datos personales.<br>
**Flujo:** abrir el formulario → ingresar un valor inválido → observar el mensaje → corregirlo y continuar.

## Cierre de sesión

Seleccionar **Salir**, en la barra superior. Se borra el token de la memoria de la aplicación y se vuelve al formulario de acceso. La sesión también se pierde al recargar la pestaña porque el token no se guarda en almacenamiento persistente del navegador.

**Captura sugerida:** `docs/img/login.png` (puede volver a capturarse luego de seleccionar Salir para documentar el resultado del flujo).<br>
**Qué muestra:** pantalla de ingreso que queda disponible luego de cerrar la sesión.<br>
**Flujo:** seleccionar Salir → confirmar que reaparece el formulario → comprobar que el token anterior ya no habilita la sesión.

## Nota sobre capturas

Los nombres, correos, legajos, fechas, identificadores y motivos que aparecen en las capturas del sistema son ficticios e inventados para demostración; no corresponden a personas reales. Se conservaron las imágenes originales. En la captura de la consola del frontend solo se ocultó la ruta local que identificaba al usuario del equipo. Las capturas que mostraban JWT completos no se incluyeron porque los tokens son credenciales. Véase [CAPTURAS.md](CAPTURAS.md) para el inventario.

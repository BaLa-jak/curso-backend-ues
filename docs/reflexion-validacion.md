# Reflexión — EC1 F3 A4

**Nombre:**
**Grupo:**

## 1. ¿Qué diferencia existe entre validar el formato HTTP y proteger una regla del negocio?

Validar el formato HTTP significa comprobar que la solicitud tiene una forma que Express y el controlador pueden interpretar: que el `Content-Type` sea `application/json` (`requireJson`), que el parámetro `:id` de la URL sea un entero positivo (`validateTaskId`) o que el cuerpo traiga un `title` de tipo texto no vacío (`validateTaskTitle`). Estas comprobaciones no requieren consultar el estado de la aplicación; se resuelven solo mirando la solicitud. Proteger una regla del negocio es distinto: requiere conocer el estado actual de los datos, como al verificar en `findTaskById` que la tarea con ese id realmente existe antes de completarla, actualizarla o eliminarla. La primera vive en middleware, porque es genérica y reutilizable; la segunda vive en el servicio, porque depende del dominio.

## 2. ¿Por qué conviene usar router.param para validar el id?

Porque siete rutas distintas de `task.routes.ts` usan el parámetro `:id` (`GET /:id`, `PATCH /:id/complete`, `PATCH /:id/status`, `PATCH /:id`, `DELETE /:id`), y sin `router.param` cada una tendría que repetir la conversión a número y la comprobación de que sea un entero positivo, como ocurría antes con la función `parseId` duplicada dentro de cada controlador. Al registrar `taskRouter.param('id', validateTaskId)` una sola vez, Express ejecuta esa validación automáticamente antes de cualquier handler que declare `:id`, garantizando que todas las rutas apliquen exactamente la misma regla y que agregar una ruta nueva (como se hizo con `/:id/status`) la herede sin escribir código adicional.

## 3. ¿Qué ventaja ofrece guardar datos normalizados en res.locals?

`res.locals` vive durante todo el ciclo petición-respuesta y es el lugar pensado para que un middleware le pase información ya validada al siguiente, sin volver a tocar `req.params` o `req.body`. Por ejemplo, `validateTaskId` guarda el id ya convertido a `number` en `res.locals.taskId`, y `validateTaskTitle` guarda el título ya recortado con `trim()` en `res.locals.taskTitle`. Gracias a esto, controladores como `getTask` o `postTask` solo leen `res.locals` y llaman al servicio, sin repetir conversiones ni normalizaciones: el dato que reciben ya está garantizado como válido y limpio.

## 4. ¿Cuándo corresponde responder 400 y cuándo 422?

`400 Bad Request` corresponde a una solicitud que no puede interpretarse correctamente a nivel de sintaxis o de tipo básico: un `:id` como `abc` o `1.5` (`INVALID_ID`) o un cuerpo con JSON malformado, como una llave sin cerrar (`INVALID_JSON`). `422 Unprocessable Entity` corresponde a una solicitud que sí es sintácticamente válida —el JSON se pudo interpretar— pero cuyos valores no cumplen las reglas de negocio esperadas, como `{"title":""}`, `{"title":25}` o un título de más de 120 caracteres (`VALIDATION_ERROR`). La diferencia es si el problema está en la forma del dato (400) o en su contenido según las reglas de la API (422).

## 5. ¿Por qué notFound delega el error en lugar de responder directamente?

Porque si `notFound` respondiera directamente con `res.status(404).json(...)`, produciría una estructura de error distinta a la de los demás problemas de la API, rompiendo el contrato uniforme `{ "error": { code, message, requestId } }`. Al convertir la ausencia de ruta en `next(new AppError(..., 404, 'ROUTE_NOT_FOUND'))`, delega la construcción de la respuesta final al mismo `errorHandler` que atiende `TASK_NOT_FOUND`, `VALIDATION_ERROR` o `INTERNAL_ERROR`, asegurando que un `GET /ruta-inexistente` tenga el mismo formato, el mismo `requestId` y el mismo manejo de encabezados que cualquier otro error de la API.

## 6. ¿Qué información no debe enviarse al cliente en un error 500?

No debe enviarse el `stack` del error, el mensaje original de la excepción (que puede describir detalles internos de implementación, nombres de archivos o consultas), ni cualquier dato de configuración o del entorno del servidor. El cliente solo recibe `code: "INTERNAL_ERROR"` y un mensaje genérico ("Ocurrió un error interno."), mientras que la información completa —incluido el error real— se registra únicamente en el servidor con `console.error({ requestId, error })`, disponible para quien tenga acceso a los logs, no para quien hizo la solicitud.

## 7. ¿Cómo ayuda requestId durante la depuración?

Cada solicitud recibe un `requestId` distinto generado por `requestContext` con `randomUUID()`, que se devuelve tanto en el encabezado `X-Request-Id` como dentro del cuerpo de cualquier respuesta de error. Si un cliente reporta que recibió un error 500 con `requestId: "ea6590ca-..."`, se puede buscar exactamente ese identificador en los logs del servidor (`console.error({ requestId, error })`) y encontrar el registro con el stack completo correspondiente a esa solicitud puntual, sin tener que adivinar cuál de todas las peticiones concurrentes falló.

## 8. ¿Qué prueba demuestra que la refactorización no rompió la API anterior?

Las pruebas de regresión documentadas en `docs/pruebas-validacion.md`: `PATCH /api/tasks/1/complete` sigue devolviendo 200 con la tarea marcada como completada, `PATCH /api/tasks/2` con un título válido sigue devolviendo 200 con el título actualizado, y `DELETE /api/tasks/2` sigue devolviendo 204 sin cuerpo. Como estas tres operaciones —que ya existían en EC1 F2 A3— produjeron exactamente el mismo resultado exitoso después de agregar toda la validación y el manejo centralizado de errores, queda demostrado que la mejora fue incremental y no rompió el comportamiento correcto que ya funcionaba.

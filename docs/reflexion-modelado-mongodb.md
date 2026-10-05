# Reflexión: modelado de documentos y persistencia en MongoDB

## 1. ¿Qué diferencia existe entre un documento, un esquema y un modelo?

El **documento** es el registro BSON guardado en la colección `tasks`, por ejemplo `{ _id: ObjectId(...), title: "Diseñar el modelo de tareas", status: "pending", createdAt, updatedAt }`. El **esquema** (`taskSchema` en `src/models/task.ts`) define las reglas que debe cumplir un documento: `title` obligatorio, recortado y de hasta 120 caracteres; `status` limitado a `pending | completed` con valor inicial `pending`; y las marcas de tiempo. El **modelo** (`TaskModel`) se construye a partir del esquema y es el objeto con el que el servicio ejecuta `find`, `create`, `findByIdAndUpdate` y `findByIdAndDelete` sobre la colección.

## 2. ¿Por qué la API devuelve id en lugar de _id?

`_id` es un `ObjectId`, un detalle interno de MongoDB. La función `toTask` en `task.service.ts` lo convierte en `id` de tipo string. Así el cliente recibe un contrato estable (`Task`) que no depende de la base de datos y no se filtra la estructura interna del documento. Por eso tampoco aparece `__v`.

## 3. ¿Qué problema evita migrar todas las operaciones a una sola fuente de datos?

Evita tener dos fuentes de verdad. Si POST y GET usaran Atlas pero PATCH y DELETE siguieran usando el arreglo, una tarea creada en Atlas no existiría en memoria, así que no se podría completar ni eliminar, y los cambios se perderían al reiniciar. Por eso se migraron `completeTask`, `deleteTask`, `setTaskStatus` y `updateTaskTitle` a `TaskModel`, y se eliminó `src/data/tasks.ts`.

## 4. ¿Qué reglas aplica el middleware y cuáles repite el esquema?

El middleware valida la entrada HTTP: `validateTaskTitle` exige un `title` de texto no vacío de hasta 120 caracteres, `validateTaskDescription` acepta `description` opcional de hasta 300 caracteres, `validateTaskId` exige un ObjectId de 24 caracteres hexadecimales y `requireJson` exige `application/json`. El esquema repite el límite de longitud, el carácter obligatorio y el recorte de `title`, el límite de 300 caracteres de `description` y además restringe `status` mediante `enum`. Así la base queda protegida aunque otro módulo use `TaskModel` sin pasar por las rutas.

## 5. ¿Qué diferencia existe entre INVALID_ID y TASK_NOT_FOUND?

`INVALID_ID` (400) lo devuelve el middleware cuando el texto de la URL no tiene formato de ObjectId, por ejemplo `/api/tasks/1`; la consulta ni siquiera llega a MongoDB. `TASK_NOT_FOUND` (404) lo decide el servicio cuando el formato es correcto, por ejemplo `507f1f77bcf86cd799439011`, pero no existe ningún documento con ese `_id`.

## 6. ¿Qué hacen timestamps y versionKey false?

`timestamps: true` hace que Mongoose asigne `createdAt` al crear y actualice `updatedAt` en cada modificación. En las pruebas, `updatedAt` cambió al completar la tarea. `versionKey: false` evita que se agregue el campo `__v`, que sirve para control de versiones de documentos y que esta API todavía no usa.

## 7. ¿Por qué los controladores deben usar async y await?

Las operaciones de Mongoose devuelven promesas. Sin `await`, el controlador intentaría responder con una `Promise` en lugar de la tarea, o respondería antes de que la base de datos terminara. Con `async/await` se espera el resultado y se selecciona el código correcto: 200, 201 o 204.

## 8. ¿Cómo llega un AppError asíncrono al errorHandler de Express 5?

En Express 5, si un controlador `async` lanza un error o su promesa es rechazada, Express captura el rechazo y llama automáticamente a `next(error)`. El error recorre la cadena hasta `errorHandler`, registrado al final de `app.ts`, que lo convierte en la respuesta uniforme `{ error: { code, message, details, requestId } }`. Por eso el servicio lanza `AppError` y no hace falta `try/catch` en los controladores.

## 9. ¿Qué prueba demuestra realmente que una tarea es persistente?

Crear una tarea, reiniciar el proceso de Node.js (en la prueba el PID cambió de 31951 a 33266) y volver a consultarla por su id. Un arreglo en memoria se pierde al reiniciar; un documento en Atlas sigue disponible. Verla en Data Explorer con el mismo `_id` lo confirma desde el lado de la base.

## 10. ¿Qué información de Mongoose o Atlas nunca debe aparecer en la respuesta HTTP?

La URI de conexión, el usuario, la contraseña y el host del clúster; los stack traces; los objetos de error completos de Mongoose (`error.message` de errores desconocidos puede incluir servidores o datos de diagnóstico); y los campos internos `_id` y `__v`. `mapPersistenceError` traduce esas fallas a `PERSISTENCE_VALIDATION_ERROR` (422) o `DATABASE_UNAVAILABLE` (503) con mensajes seguros.

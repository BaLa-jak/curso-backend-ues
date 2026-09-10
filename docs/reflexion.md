# Reflexión — EC1 F2 A3

**Nombre:**
**Grupo:**

## 1. ¿Qué responsabilidad cumple Express y qué responsabilidad conserva el servicio?

Express se encarga exclusivamente de la infraestructura HTTP: recibe la solicitud, la compara contra las rutas registradas, interpreta el cuerpo JSON con `express.json()`, y entrega la respuesta con el código de estado adecuado. El servicio (`task.service.ts`) no conoce nada de HTTP; contiene las reglas de negocio puras (cómo se crea, completa, actualiza o elimina una tarea, y qué condiciones hacen inválida una operación). Esta separación permite, por ejemplo, reutilizar el servicio desde una prueba automatizada o desde otro tipo de interfaz sin depender de Express.

## 2. ¿Por qué no conviene escribir toda la lógica dentro de task.routes.ts?

Porque mezclaría tres responsabilidades distintas (enrutamiento, traducción HTTP y reglas de negocio) en un solo archivo, dificultando el mantenimiento y la prueba de cada parte por separado. Al delegar en controladores y servicios, `task.routes.ts` solo declara "qué combinación de método y URL llama a qué función", lo que lo mantiene corto, legible y fácil de modificar sin tocar la lógica interna.

## 3. ¿Qué diferencia existe entre req.params y req.body?

`req.params` contiene los valores capturados de la propia URL a través de los segmentos dinámicos definidos con `:` (por ejemplo, el `3` en `/api/tasks/3` llega en `req.params.id`), y siempre se recibe como texto. `req.body` contiene el cuerpo de la solicitud, típicamente un objeto JSON enviado por el cliente en `POST` o `PATCH`, y solo está disponible porque `express.json()` lo interpreta antes de que la ruta lo consulte.

## 4. ¿Por qué el título recibido desde un cliente se considera unknown antes de validarlo?

Porque el cuerpo de la solicitud proviene de fuera de la aplicación y el cliente puede enviar cualquier tipo de valor (un número, un arreglo, `null` o incluso omitir el campo). Tipar el parámetro como `unknown` obliga a TypeScript a exigir una comprobación explícita (`typeof title !== 'string'`) antes de usarlo como cadena, evitando asumir una forma de dato que en realidad no está garantizada.

## 5. ¿Qué ventaja ofrece centralizar los errores en un middleware?

Evita repetir en cada controlador la lógica de decidir el código HTTP y el formato del mensaje de error. Los controladores solo necesitan llamar a `next(error)` y el middleware `errorHandler` decide de forma uniforme: si el error es un `AppError` conocido, responde con su `statusCode` y mensaje; si es un error inesperado, lo registra en el servidor y responde `500` con un mensaje genérico y seguro para el cliente.

## 6. ¿Cuándo debe utilizarse 201 en lugar de 200?

`201 Created` se usa cuando la solicitud creó un recurso nuevo, como sucede en `POST /api/tasks`. `200 OK` se reserva para operaciones que consultan o modifican un recurso ya existente sin crear uno nuevo, como `GET`, `PATCH /complete` o `PATCH /:id` en esta API.

## 7. ¿Por qué DELETE responde 204 sin un objeto JSON?

Porque `204 No Content` indica explícitamente que la operación se completó con éxito pero no hay ningún contenido que devolver: la tarea ya no existe, así que no tiene sentido representar un recurso eliminado en el cuerpo de la respuesta. Enviar un cuerpo junto con 204 contradice la especificación HTTP, por eso el controlador usa `res.status(204).send()` sin `json()`.

## 8. ¿Qué ocurrirá con las tareas cuando el servidor se reinicie y por qué?

Todas las tareas volverán a su estado inicial (las dos tareas semilla de `src/data/tasks.ts`), y cualquier tarea creada, completada, editada o eliminada durante la ejecución se perderá. Esto ocurre porque los datos viven únicamente en un arreglo en memoria del proceso de Node.js; al terminar el proceso, esa memoria se libera y el arreglo se reconstruye desde su valor inicial al arrancar de nuevo.

## 9. ¿Qué archivos podrán conservarse cuando se incorpore MongoDB Atlas?

Los archivos de la capa HTTP —`app.ts`, `server.ts`, `routes/task.routes.ts`, `controllers/task.controller.ts`, `middlewares/` y `errors/app-error.ts`— podrán conservarse prácticamente sin cambios, porque no dependen de cómo se almacenan los datos. También se conserva `models/task.ts`, ya que la forma de una tarea no cambia. Lo que deberá modificarse es `data/tasks.ts` (que dejará de ser un arreglo en memoria para convertirse en la conexión a la base de datos) y las funciones internas de `services/task.service.ts` (que pasarán a ser `async` y usar consultas de MongoDB en lugar de operaciones de arreglo), manteniendo la misma firma pública que ya consumen los controladores.

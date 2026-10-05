# Pruebas de modelado y persistencia

## Entorno

- Rama: feature/modelo-tareas-mongodb
- Base: [OCULTO] (valor de `MONGODB_DB_NAME` en `.env`; la guía indica `task_api`)
- Colección: tasks
- Resultado de pnpm check: correcto, sin errores (`tsc --noEmit`).
- Resultado de pnpm build: correcto, sin errores; `dist/models/task.js` generado.
- Conexión: `GET /health` → 200 `{"status":"ok"}`; `GET /health/database` → 200 `{"data":{"database":{"status":"connected"}}}`.

## Documento comprobado

- id devuelto por la API: `6ac420c71b839c1011889c0f` (24 caracteres hexadecimales).
- Campos observados en Atlas: `_id`, `title`, `status`, `createdAt`, `updatedAt` (sin `__v`). _Pendiente: captura de Data Explorer sin URI, usuario ni contraseña._
- Resultado después de reiniciar: el proceso de Node.js cambió de PID 31951 a PID 33266. `GET /api/tasks/6ac420c71b839c1011889c0f` respondió 200 con el mismo título y las mismas fechas, y `GET /api/tasks` siguió listando la tarea.

## Casos ejecutados

| Tipo            | Método y ruta                           | Datos                             | Esperado                   | Obtenido                                                         | requestId                            | Resultado   |
| --------------- | --------------------------------------- | --------------------------------- | -------------------------- | ---------------------------------------------------------------- | ------------------------------------ | ----------- |
| Positiva        | GET /health/database                    | No aplica                         | 200 connected              | 200 connected                                                    | No aplica                            | Correcto    |
| Persistencia    | POST /api/tasks                         | title válido                      | 201                        | 201, id `6ac420c71b839c1011889c0f`, status pending               | 59ea3b4e-2965-4bb4-b0d6-f98f226a8cf5 | Correcto    |
| Persistencia    | GET /api/tasks                          | No aplica                         | 200                        | 200, arreglo con la tarea, sin `_id`/`__v`                       | 9a98989b-3510-4be9-8503-7bfe178b65cf | Correcto    |
| Persistencia    | GET /api/tasks/{{taskId}}               | No aplica                         | 200                        | 200, mismo recurso                                               | fb30e7a8-c812-4963-a7a5-7baa70c99c5d | Correcto    |
| Persistencia    | Reinicio + GET /api/tasks/{{taskId}}    | No aplica                         | 200                        | 200, la tarea permanece                                          | 14310924-d750-4b6c-a04e-acdf4e4009f8 | Correcto    |
| Regresión       | POST /api/tasks                         | title válido                      | 201                        | 201                                                              | d09ea4ca-c78f-44cd-99a5-0d3f4db9fd24 | Correcto    |
| Regresión       | GET /api/tasks/{{taskId}}               | No aplica                         | 200                        | 200                                                              | e1df6723-5e28-412f-bc8d-89ef0c9370a2 | Correcto    |
| Regresión       | PATCH /api/tasks/{{taskId}}/complete    | No aplica                         | 200 completed              | 200 completed; updatedAt cambió de 22:12:32.042Z a 22:12:33.104Z | 653703fb-8876-4c13-b292-4205f7e46136 | Correcto    |
| Regresión       | GET /api/tasks/{{taskId}}               | No aplica                         | 200                        | 200 completed                                                    | 2deda0f5-4a94-4294-951c-8c72b309fd6f | Correcto    |
| Regresión       | PATCH /api/tasks/{{taskId}}/status      | `{"completed": false}`            | 200 pending                | 200 pending                                                      | a55de7c1-98df-4b76-9a22-ce9240a2df6f | Correcto    |
| Regresión       | PATCH /api/tasks/{{taskId}}             | `{"title": "Título actualizado"}` | 200                        | 200 con el nuevo título                                          | 871a5d87-9747-469d-947a-97f5d8a9a7b0 | Correcto    |
| Regresión       | DELETE /api/tasks/{{taskId}}            | No aplica                         | 204                        | 204                                                              | 34614474-0755-4cbd-bca1-9f08b4034e4d | Correcto    |
| Regresión       | GET /api/tasks/{{taskId}}               | No aplica                         | 404 TASK_NOT_FOUND         | 404 TASK_NOT_FOUND                                               | c40e15b6-4ad4-4d73-bf33-90304b853fe6 | Correcto    |
| Negativa        | GET /api/tasks/1                        | No aplica                         | 400 INVALID_ID             | 400 INVALID_ID                                                   | ce165ee9-82d4-4b33-8a2c-8845826ba9c6 | Correcto    |
| Negativa        | GET /api/tasks/507f1f77bcf86cd799439011 | ObjectId inexistente              | 404 TASK_NOT_FOUND         | 404 TASK_NOT_FOUND                                               | 87d03f0a-2c28-419d-b1cc-bd3ee9fb2913 | Correcto    |
| Negativa        | POST /api/tasks                         | title vacío                       | 422 VALIDATION_ERROR       | 422 VALIDATION_ERROR (field title)                               | 788cc43e-0bf2-447f-88c3-995d7529e94f | Correcto    |
| Negativa        | POST /api/tasks                         | title de 121 caracteres           | 422 VALIDATION_ERROR       | 422 VALIDATION_ERROR (field title)                               | 74572259-4d43-4dee-a5b5-1e5fe092c3c1 | Correcto    |
| Negativa        | POST /api/tasks                         | raw Text                          | 415 UNSUPPORTED_MEDIA_TYPE | 415 UNSUPPORTED_MEDIA_TYPE                                       | 4d55e2e1-fdb0-4b14-96f8-24d06888d5cb | Correcto    |
| Infraestructura | Arranque                                | Contraseña incorrecta             | API no escucha             | _Pendiente de ejecutar_                                          | No aplica                            | _Pendiente_ |

### Desafío individual: description opcional

| Caso                            | Datos                                 | Esperado                                | Obtenido                                | requestId                            | Resultado |
| ------------------------------- | ------------------------------------- | --------------------------------------- | --------------------------------------- | ------------------------------------ | --------- |
| Creación válida con description | `"   Texto con espacios externos   "` | 201, description recortada              | 201, `"Texto con espacios externos"`    | bb8a83d8-1aaf-4fc2-8357-65c8f03b6cab | Correcto  |
| Creación sin description        | solo title                            | 201, sin campo description              | 201, sin campo description              | 59ea3b4e-2965-4bb4-b0d6-f98f226a8cf5 | Correcto  |
| description de 301 caracteres   | 301 caracteres                        | 422 VALIDATION_ERROR, field description | 422, `details[0].field = "description"` | 7bf18ffd-e00f-4c09-83ca-9e6e48fbc71f | Correcto  |
| description no textual          | `5`                                   | 422 VALIDATION_ERROR, field description | 422, `"Debe ser texto."`                | 26ba21cc-8573-446d-90ef-861c077697cc | Correcto  |
| Persistencia de description     | GET después del reinicio              | 200 con description                     | 200, description presente               | a0a31558-81be-4462-b412-797843fa16d2 | Correcto  |

## Evidencias

1. Compilación correcta: `pnpm check` y `pnpm build` terminaron sin errores.
2. POST y documento visible en Atlas sin credenciales: _agregar captura de Data Explorer._
3. Consulta después de reiniciar: el PID cambió de 31951 a 33266 y la tarea `6ac420c71b839c1011889c0f` siguió disponible.
4. Un error HTTP (400 INVALID_ID), una regla del negocio (404 TASK_NOT_FOUND) y una falla de infraestructura (_pendiente: arranque con contraseña inválida; la API debe mostrar solo el mensaje seguro de `server.ts` y no abrir el puerto_).

Colección de Postman: `docs/Task-API-EC2-F2-A6.postman_collection.json`.

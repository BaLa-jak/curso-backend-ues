# Pruebas de validación y errores

Pruebas ejecutadas contra `http://localhost:3000` con `curl -i`, en el orden indicado por la guía EC1 F3 A4. El `requestId` de cada fila es el que devolvió el cuerpo `error.requestId`; en todos los casos coincidió con el encabezado `X-Request-Id` de la misma respuesta.

| Caso | Método y ruta | Datos enviados | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| 1 | GET /api/tasks | Sin cuerpo | 200 | 200, `{"data":[...]}` con las 2 tareas iniciales | — (sin error) | Aprobada |
| 2 | GET /api/tasks/abc | Sin cuerpo | 400 INVALID_ID | 400, `INVALID_ID` | d094fd57-3740-4f89-b926-0b94c77aa626 | Aprobada |
| 2 (0) | GET /api/tasks/0 | Sin cuerpo | 400 INVALID_ID | 400, `INVALID_ID` | d38fcfcf-491c-4f54-a8c0-cb4df3501ef2 | Aprobada |
| 2 (-2) | GET /api/tasks/-2 | Sin cuerpo | 400 INVALID_ID | 400, `INVALID_ID` | 3679069b-dca3-4927-b354-d1ab0aee0797 | Aprobada |
| 2 (1.5) | GET /api/tasks/1.5 | Sin cuerpo | 400 INVALID_ID | 400, `INVALID_ID` | fc8c8311-bdfd-40ed-b3b4-08ad8ba0c04b | Aprobada |
| 3 | GET /api/tasks/999 | Sin cuerpo | 404 TASK_NOT_FOUND | 404, `TASK_NOT_FOUND` | 9cc1f118-3333-4667-84d7-7c651c113619 | Aprobada |
| 4 | POST /api/tasks | `{"title":"Documentar pruebas EC1 F3 A4"}` | 201 | 201, tarea creada con id 3 | 94c49085-17af-47ca-9d79-fb42711e304a | Aprobada |
| 5 | POST /api/tasks | Igual que el caso 4, con `Content-Type: text/plain` | 415 UNSUPPORTED_MEDIA_TYPE | 415, `UNSUPPORTED_MEDIA_TYPE` | e3900e40-52c4-4e76-a317-4669dfbd66ee | Aprobada |
| 6 | POST /api/tasks | `{"title":""}` | 422 VALIDATION_ERROR | 422, `VALIDATION_ERROR`, `details: title` no vacío | d198501d-ffc7-4bf1-b1ec-7621b0792f35 | Aprobada |
| 7 | POST /api/tasks | `{"title":25}` | 422 VALIDATION_ERROR | 422, `VALIDATION_ERROR`, `details: title` no vacío | 582b51c4-c2ea-4e83-84dc-094bafc34387 | Aprobada |
| 7b | POST /api/tasks | `{"title":"a...a"}` (121 caracteres) | 422 VALIDATION_ERROR | 422, `VALIDATION_ERROR`, `details: title` ≤ 120 caracteres | 507a3d09-351d-4e68-af99-2794762cc7e7 | Aprobada |
| 8 | POST /api/tasks | `{"title": "sin cerrar"` (JSON malformado) | 400 INVALID_JSON | 400, `INVALID_JSON` | c0114270-cfbf-4c69-b4ad-d25d2537ae5a | Aprobada |
| 9 | GET /ruta-inexistente | Sin cuerpo | 404 ROUTE_NOT_FOUND | 404, `ROUTE_NOT_FOUND` | bd04480a-c5c1-4276-a1df-78da242d9257 | Aprobada |
| 10 | GET /debug/error (ruta temporal) | Sin cuerpo | 500 INTERNAL_ERROR | 500, `INTERNAL_ERROR`, sin stack ni detalles internos | ea6590ca-6739-4ef9-ba48-323f55abb912 | Aprobada |

## Pruebas de regresión

| Caso | Método y ruta | Datos enviados | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| R1 | PATCH /api/tasks/1/complete | Sin cuerpo | 200 | 200, tarea 1 con `status: "completed"` | e011790f-b0ec-4276-911e-da45c35d85d3 | Aprobada |
| R2 | PATCH /api/tasks/2 | `{"title":"Titulo actualizado"}` | 200 | 200, tarea 2 con título actualizado | 08edc739-dc75-432b-ba05-0b2a19c457cc | Aprobada |
| R3 | DELETE /api/tasks/2 | Sin cuerpo | 204 | 204, sin cuerpo | 2fd62adc-2b69-4ef0-bbdf-998b6d450163 | Aprobada |

## Desafío individual — PATCH /api/tasks/:id/status

| Caso | Método y ruta | Datos enviados | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| D1 | PATCH /api/tasks/2/status | `{"completed":false}` | 200 | 200, tarea 2 con `status: "pending"` | 8a9e988f-fff3-40c0-98ed-58271a419719 | Aprobada |
| D2 | PATCH /api/tasks/2/status | `{"completed":"si"}` | 422 VALIDATION_ERROR | 422, `VALIDATION_ERROR`, `details: completed` debe ser booleano | 36cb7ce6-4a05-4050-83cb-3cb45a6d6487 | Aprobada |
| D3 | PATCH /api/tasks/2/status | `{"completed":true}` con `Content-Type: text/plain` | 415 UNSUPPORTED_MEDIA_TYPE | 415, `UNSUPPORTED_MEDIA_TYPE` | 77b098e7-fcee-4828-b827-e090e8b3f9e3 | Aprobada |
| D4 | PATCH /api/tasks/999/status | `{"completed":true}` | 404 TASK_NOT_FOUND | 404, `TASK_NOT_FOUND` | 99b75baa-0a51-4264-a0eb-46f01b7ac42b | Aprobada |

## Verificación adicional

- `pnpm check` y `pnpm build` terminan sin errores tras el refactor.
- El `requestId` del cuerpo JSON coincidió con el encabezado `X-Request-Id` en las 18 solicitudes anteriores.
- La ruta temporal `GET /debug/error` se eliminó de `src/app.ts` antes de confirmar los cambios en Git.

## Pendiente

Las capturas de pantalla de Postman (estados 400, 404, 415, 422, 500 y una respuesta correcta) quedan pendientes de tomar directamente en Postman importando `docs/Task-API-EC1-F3-A4.postman_collection.json` y ejecutando la colección en el orden indicado.

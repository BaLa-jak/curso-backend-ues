# Pruebas de consultas de tareas

## Entorno

- Rama: feature/consultas-paginadas
- Base: task_api
- Colección: tasks
- Resultado de pnpm check: sin errores
- Resultado de pnpm build: sin errores; `dist/repositories/task.repository.js`, `dist/types/task-query.js` y `dist/middlewares/validate-task-query.middleware.js` generados
- Fecha de ejecución: 2026-10-21, API compilada (`node dist/server.js`) conectada a Atlas

## Datos preparados

La colección ya tenía 4 tareas de actividades anteriores (2 pending y 2 completed); no se borraron. Se agregaron las 5 tareas guiadas y se cambiaron Documentar MongoDB y Revisar API a completed.

- Total de tareas: 9
- Tareas pending: 5
- Tareas completed: 4

| Tarea guiada | id | status |
|---|---|---|
| Aprender Express | 6ad8f33fc7392210313390df | pending |
| Documentar MongoDB | 6ad8f33fc7392210313390e1 | completed |
| Practicar búsqueda | 6ad8f33fc7392210313390e3 | pending |
| Revisar API | 6ad8f340c7392210313390e5 | completed |
| Preparar entrega | 6ad8f340c7392210313390e7 | pending |

## Casos ejecutados

El requestId de las respuestas exitosas se tomó del encabezado `X-Request-Id`.

| Tipo | Método y ruta | Esperado | Obtenido | requestId | Resultado |
|---|---|---:|---:|---|---|
| Positiva | GET /api/tasks | 200 | 200 | 28298b2c-ebdd-4eec-abf8-1a6c905bbb82 | page 1, limit 10, total 9, createdAt asc, sin `_id` ni `__v` |
| Positiva | GET /api/tasks?page=1&limit=2 | 200 | 200 | 03c12116-e02b-4cea-90fc-e68cdf4f410e | 2 tareas, totalPages 5, hasNextPage true, hasPreviousPage false |
| Positiva | GET /api/tasks?page=2&limit=2 | 200 | 200 | e1c96723-6b13-4627-8798-6180c3169446 | Sin documentos repetidos respecto a page=1 |
| Positiva | GET /api/tasks?status=completed | 200 | 200 | 01d00867-4333-4daa-bedd-0abf4ecc2f98 | Solo completed, total 4 |
| Positiva | GET /api/tasks?status=pending | 200 | 200 | adcef646-1776-4225-a061-a190621afbc2 | Solo pending, total 5 |
| Positiva | GET /api/tasks?search=api | 200 | 200 | 235738c1-5c7e-48b8-a9c5-af6cbd178519 | Revisar API |
| Positiva | GET /api/tasks?search=MONGODB | 200 | 200 | 91bc438a-44d6-4aba-9bd4-777b14583237 | Documentar MongoDB (sin distinguir mayúsculas) |
| Positiva | GET /api/tasks?search=.* | 200 | 200 | 37e093b7-3683-45f4-a387-6ab4f23dee8a | total 0: se interpreta como texto literal |
| Positiva | GET /api/tasks?sortBy=title&order=asc&limit=50 | 200 | 200 | 6b2bc420-1f18-4be4-952c-374e3677b989 | Aprender Express, Documentar MongoDB, Practicar búsqueda… |
| Positiva | GET /api/tasks?sortBy=title&order=desc&limit=50 | 200 | 200 | ecdca222-4774-47c5-9822-79f295bb4049 | Orden inverso |
| Positiva | GET /api/tasks?sortBy=updatedAt&order=desc&limit=2 | 200 | 200 | de7eca66-5fed-45ec-93d4-0f04dd6c3157 | Revisar API, Documentar MongoDB (las modificadas) |
| Positiva | GET /api/tasks?status=pending&search=entrega&page=1&limit=2&sortBy=title&order=asc | 200 | 200 | 2f1a2509-f752-4621-84dd-7d1ce8ae5e63 | Preparar entrega, total 1 |
| Positiva | Misma URL sin search | 200 | 200 | bc327954-dc53-4bf8-a0a9-6dafc8164928 | total 5, misma estructura |
| Positiva | GET /api/tasks?page=99&limit=2 | 200 | 200 | 7344cf75-3408-4259-b961-39b1c0a7c8e1 | data vacío, hasNextPage false, hasPreviousPage true |
| Negativa | GET /api/tasks?page=0 | 422 | 422 | 6bd6fce5-89aa-4164-8ef7-107b1aab9f7f | details: page |
| Negativa | GET /api/tasks?page=abc | 422 | 422 | 70eca745-407a-4f98-b9f1-5606cd6189f5 | details: page |
| Negativa | GET /api/tasks?page=1&page=2 | 422 | 422 | c844138a-8f1f-465f-adcf-5d84941feb6e | details: page |
| Negativa | GET /api/tasks?limit=0 | 422 | 422 | 1f2efea1-c36e-4557-a9f7-6b807635dbd3 | details: limit |
| Negativa | GET /api/tasks?limit=51 | 422 | 422 | 6e0bda5b-cd92-408f-8e76-21032d76458f | details: limit |
| Negativa | GET /api/tasks?status=archived | 422 | 422 | 9079cf24-ceec-4680-981b-adf30d287405 | details: status |
| Negativa | GET /api/tasks?search= | 422 | 422 | 9f659c37-17dd-4dbc-823c-606b496ce139 | details: search |
| Negativa | GET /api/tasks?search=(61 caracteres) | 422 | 422 | d2cdff61-bb56-48ac-9590-67a909b4ab76 | details: search |
| Negativa | GET /api/tasks?sortBy=priority | 422 | 422 | a77fee31-2cd7-4529-9833-1a45acd21d50 | details: sortBy |
| Negativa | GET /api/tasks?order=sideways | 422 | 422 | 7362b8f5-ae35-4524-8f2e-bdb8017fa5f1 | details: order |
| Negativa | GET /api/tasks?owner=ana | 422 | 422 | 61bb1997-b65f-49d1-8362-b1f2084e876f | details identifica `owner` |
| Negativa | GET /api/tasks sin acceso a Atlas | 503 | 503 | e691d300-dadb-48bd-81ed-8f5cbd6e9b0a | DATABASE_UNAVAILABLE sin información interna (ejecutada antes de autorizar la IP) |
| Regresión | POST /api/tasks | 201 | 201 | 360643e9-db2b-4c46-99cf-8d83e36e6cb6 | Creada con description |
| Regresión | GET /api/tasks/:id | 200 | 200 | ec4560c3-d6cf-426b-be8e-4fab62f7a316 | Consultada |
| Regresión | PATCH /api/tasks/:id | 200 | 200 | c90cbb09-d7b8-4d18-b73f-de0c9ff017f0 | title actualizado |
| Regresión | PATCH /api/tasks/:id/complete | 200 | 200 | 3b38858e-7793-4d26-b092-1583c8019169 | status completed |
| Regresión | PATCH /api/tasks/:id/status | 200 | 200 | 1638bb6c-dbdf-4e14-a66d-0c68a32fed24 | status pending |
| Regresión | DELETE /api/tasks/:id | 204 | 204 | ed56fc93-851b-49d3-9e14-5b6845820ec9 | Sin cuerpo |
| Regresión | GET /api/tasks/:id eliminado | 404 | 404 | 9cdfda35-4789-465c-9996-0913898aabc5 | TASK_NOT_FOUND |
| Regresión | GET /api/tasks/abc | 400 | 400 | f9c8756b-9c08-4ce7-9244-9be643c5a21f | INVALID_ID |
| Regresión | GET /no-existe | 404 | 404 | b94d5bbd-dbd9-465f-a5b3-b0c220aed7b2 | ROUTE_NOT_FOUND |
| Regresión | POST /api/tasks sin JSON | 415 | 415 | 04f43032-cbc5-4a55-b6d4-3d531f7b628c | UNSUPPORTED_MEDIA_TYPE |

## Desafío createdFrom y createdTo

| Tipo | Método y ruta | Esperado | Obtenido | requestId | Resultado |
|---|---|---:|---:|---|---|
| Positiva | GET /api/tasks?createdFrom=2026-10-21T17:15:43.753Z&createdTo=2026-10-21T17:15:44.556Z&limit=50 | 200 | 200 | 80e88308-0047-4159-a069-53a523b52fa6 | Solo las 5 tareas guiadas, total 5 |
| Positiva | GET /api/tasks?createdFrom=2026-10-21T17:15:43.753Z&status=completed&search=api&sortBy=title&order=desc&page=1&limit=5 | 200 | 200 | a6295edb-bb46-41f5-b48d-5dec547982fc | Revisar API: rango combinado con status, search, orden y paginación |
| Positiva | GET /api/tasks?createdTo=2026-10-09 | 200 | 200 | 3523e71e-f42e-47f9-bbe5-c8b8f15c1470 | total 3, todas creadas antes del 2026-10-09 |
| Negativa | GET /api/tasks?createdFrom=abc | 422 | 422 | d28824a9-e926-49bb-ae9b-92f72ca2e83d | details: createdFrom |
| Negativa | GET /api/tasks?createdFrom=2026-10-22&createdTo=2026-10-01 | 422 | 422 | 17eb5a0e-2017-4d7b-a62a-c7dacdcc2d7d | createdFrom posterior a createdTo |
| Regresión | GET /api/tasks | 200 | 200 | 28298b2c-ebdd-4eec-abf8-1a6c905bbb82 | Sin fechas no se filtra por createdAt (total 9) |

## Observación

`sortBy=title` usa la comparación binaria de MongoDB: los títulos con mayúscula inicial aparecen antes que los que empiezan con minúscula (por ejemplo, "Revisar API" antes de "documentar crud"). Para ordenar sin distinguir mayúsculas haría falta una collation, que queda fuera del alcance de A8.

## Evidencias

1. Compilación correcta: pnpm check y pnpm build sin errores.
2. Dos páginas sin documentos repetidos: page=1 y page=2 con limit=2.
3. Filtro y búsqueda combinados: status=pending&search=entrega devuelve solo Preparar entrega.
4. Orden ascendente y descendente: sortBy=title con asc y desc.
5. Error 422 con details y requestId: 13 casos negativos.
6. CRUD heredado completo: POST, GET por id, PATCH, PATCH complete, PATCH status y DELETE.
7. Persistencia después de reiniciar: se detuvo la API con SIGINT (cierre ordenado), se volvió a iniciar y `GET /api/tasks?createdFrom=2026-10-21` devolvió las 5 tareas guiadas con sus estados (requestId 1774c309-0e6f-459e-ab7f-7df1421ecadb).

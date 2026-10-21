# Pruebas de consultas de tareas

## Entorno

- Rama: feature/consultas-paginadas
- Base: task_api
- Colección: tasks
- Resultado de pnpm check: sin errores
- Resultado de pnpm build: sin errores; `dist/repositories/task.repository.js`, `dist/types/task-query.js` y `dist/middlewares/validate-task-query.middleware.js` generados
- Estado de Atlas el 2026-10-21: conexión rechazada por la lista de acceso de red (IP no autorizada). Los casos que requieren datos quedan pendientes hasta autorizar la IP.

## Datos preparados

- Total de tareas: pendiente (Atlas)
- Tareas pending: pendiente (Atlas)
- Tareas completed: pendiente (Atlas)
- Conjunto guiado por crear: Aprender Express, Documentar MongoDB, Practicar búsqueda, Revisar API y Preparar entrega; Documentar MongoDB y Revisar API pasan a completed.

## Casos ejecutados

Las pruebas negativas se ejecutaron con curl contra `app` en un puerto local sin conexión a Atlas: el middleware las rechaza antes de llegar al repositorio.

| Tipo | Método y ruta | Esperado | Obtenido | requestId | Resultado |
|---|---|---:|---:|---|---|
| Positiva | GET /api/tasks | 200 | pendiente | | Pendiente (Atlas) |
| Positiva | GET /api/tasks?page=1&limit=2 | 200 | pendiente | | Pendiente (Atlas) |
| Positiva | GET /api/tasks?page=2&limit=2 | 200 | pendiente | | Pendiente (Atlas) |
| Positiva | GET /api/tasks?status=completed | 200 | pendiente | | Pendiente (Atlas) |
| Positiva | GET /api/tasks?search=api | 200 | pendiente | | Pendiente (Atlas) |
| Positiva | GET /api/tasks?sortBy=title&order=asc | 200 | pendiente | | Pendiente (Atlas) |
| Positiva | GET /api/tasks?createdFrom=2026-01-01&createdTo=2026-12-31 | 200 | pendiente | | Pendiente (Atlas) |
| Negativa | GET /api/tasks?page=0 | 422 | 422 | b321dd8d-1d62-4e18-ad09-5a5a3de5a441 | Correcto |
| Negativa | GET /api/tasks?page=abc | 422 | 422 | 70dde3b0-ad44-4182-9177-2eba808b2cf9 | Correcto |
| Negativa | GET /api/tasks?page=1&page=2 | 422 | 422 | d428ff47-644d-433f-b409-8eca25bb55b3 | Correcto |
| Negativa | GET /api/tasks?limit=0 | 422 | 422 | 496bd1c8-78e0-41db-943d-fd76670c2fb9 | Correcto |
| Negativa | GET /api/tasks?limit=51 | 422 | 422 | 0e3701f0-0633-4b9a-81f4-1a9a22fcd034 | Correcto |
| Negativa | GET /api/tasks?status=archived | 422 | 422 | 5a021562-06ba-4c56-84c2-54300ad441bb | Correcto |
| Negativa | GET /api/tasks?search= | 422 | 422 | afbdbf4c-b2a2-4d96-909f-26d040402b5f | Correcto |
| Negativa | GET /api/tasks?search=(61 caracteres) | 422 | 422 | c303c8c3-c9c6-4ac7-9a77-84e67f07c2c1 | Correcto |
| Negativa | GET /api/tasks?sortBy=priority | 422 | 422 | fe8a78e2-80c9-472b-9dd9-d6cd937b3c7f | Correcto |
| Negativa | GET /api/tasks?order=sideways | 422 | 422 | 6799fa59-22b2-474d-a794-53005c9d540b | Correcto |
| Negativa | GET /api/tasks?owner=ana | 422 | 422 | e6e144c5-21ab-4a01-b401-5b9be8154cf6 | Correcto; details identifica `owner` |
| Negativa | GET /api/tasks?createdFrom=abc | 422 | 422 | de8530e3-db47-4a7f-be2b-a9fc81ccbd17 | Correcto (desafío) |
| Negativa | GET /api/tasks?createdFrom=2026-10-22&createdTo=2026-10-01 | 422 | 422 | f10e4642-2257-491d-9b5a-5b0636f235c7 | Correcto (desafío) |
| Negativa | GET /api/tasks sin Atlas | 503 | 503 | e691d300-dadb-48bd-81ed-8f5cbd6e9b0a | Correcto; DATABASE_UNAVAILABLE sin información interna |
| Regresión | GET /api/tasks/abc | 400 | 400 | 35c3ebc2-651d-4f47-b260-e7ab1918c6e7 | Correcto |
| Regresión | GET /no-existe | 404 | 404 | 0249a32f-6d42-4887-ad8f-39d7f5f28329 | Correcto |
| Regresión | POST /api/tasks sin JSON | 415 | 415 | 04f43032-cbc5-4a55-b6d4-3d531f7b628c | Correcto |
| Regresión | POST /api/tasks {} | 422 | 422 | c66e85df-dd05-4547-8032-25341eb1a9d7 | Correcto |
| Regresión | POST /api/tasks | 201 | pendiente | | Pendiente (Atlas) |
| Regresión | GET /api/tasks/:id | 200 | pendiente | | Pendiente (Atlas) |
| Regresión | PATCH /api/tasks/:id | 200 | pendiente | | Pendiente (Atlas) |
| Regresión | PATCH /api/tasks/:id/complete | 200 | pendiente | | Pendiente (Atlas) |
| Regresión | PATCH /api/tasks/:id/status | 200 | pendiente | | Pendiente (Atlas) |
| Regresión | DELETE /api/tasks/:id | 204 | pendiente | | Pendiente (Atlas) |

## Comprobación del repositorio sin Atlas

Con `TaskModel.find` y `TaskModel.countDocuments` sustituidos por funciones de prueba se verificó:

- `page=2&limit=2` produce `skip(2)` y `limit(2)`.
- `find` y `countDocuments` reciben el mismo objeto `filter`.
- `status`, `search` y el rango `createdAt` (`$gte`/`$lte`) coexisten en el mismo filtro.
- `search=.*` se convierte en el patrón literal `\.\*` con la opción `i`.
- Sin parámetros el orden es `{ createdAt: 1, _id: 1 }`; `order=desc` invierte ambos criterios.
- Con total 5 y limit 2: `totalPages` 3, `hasNextPage` y `hasPreviousPage` coherentes; una página posterior al total no tiene página siguiente.
- `data` contiene solo `id`, `title`, `status`, `createdAt` y `updatedAt` (sin `_id` ni `__v`).

## Desafío createdFrom y createdTo

- Positiva: `GET /api/tasks?createdFrom=2026-01-01&createdTo=2026-12-31` — pendiente (Atlas).
- Negativa: `createdFrom=abc` y `createdFrom` posterior a `createdTo` responden 422.
- Regresión: sin `createdFrom`/`createdTo` el filtro no incluye `createdAt`.

## Evidencias

1. Compilación correcta.
2. Dos páginas sin documentos repetidos: pendiente (Atlas).
3. Filtro y búsqueda combinados: verificado en el repositorio; pendiente con datos reales.
4. Orden ascendente y descendente: verificado en el repositorio; pendiente con datos reales.
5. Error 422 con details y requestId: correcto.
6. CRUD heredado completo: rutas de error correctas; operaciones con Atlas pendientes.
7. Persistencia después de reiniciar: pendiente (Atlas).

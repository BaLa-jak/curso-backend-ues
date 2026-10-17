# Pruebas del CRUD persistente

## Entorno

- Rama: feature/crud-persistente-completo
- Base: task_api
- Colección: tasks
- Resultado de pnpm check: sin errores
- Resultado de pnpm build: sin errores; `dist/middlewares/validate-task-update.middleware.js` generado

## Recurso de prueba

- id devuelto por POST:
- title inicial:
- title final:
- status final:
- Persistencia después de reiniciar:

## Casos ejecutados

| Tipo | Método y ruta | Datos | Esperado | Obtenido | requestId | Resultado |
|---|---|---|---|---|---|---|
| Positiva | POST /api/tasks | {"title":"Tarea"} | 201 | | | |
| Positiva | GET /api/tasks | sin cuerpo | 200 | | | |
| Positiva | GET /api/tasks/:id | sin cuerpo | 200 | | | |
| Positiva | PATCH /api/tasks/:id | {"title":"Nuevo"} | 200 | | | |
| Positiva | PATCH /api/tasks/:id | {"status":"completed"} | 200 | | | |
| Positiva | PATCH /api/tasks/:id | {"title":"Revisar evidencias","status":"pending"} | 200 | | | |
| Positiva | PATCH /api/tasks/:id | {"description":"Detalle"} | 200 | | | |
| Positiva | DELETE /api/tasks/:id | sin cuerpo | 204 | | | |
| Negativa | GET /api/tasks/1 | sin cuerpo | 400 INVALID_ID | | | |
| Negativa | PATCH /api/tasks/:id | ObjectId inexistente | 404 | | | |
| Negativa | PATCH /api/tasks/:id | cuerpo vacío | 422 | | | |
| Negativa | PATCH /api/tasks/:id | {"title":"   "} | 422 | | | |
| Negativa | PATCH /api/tasks/:id | {"status":"archived"} | 422 | | | |
| Negativa | PATCH /api/tasks/:id | {"owner":"Ana"} | 422 | | | |
| Negativa | PATCH /api/tasks/:id | JSON mal formado | 400 | | | |
| Negativa | PATCH /api/tasks/:id | sin application/json | 415 | | | |
| Negativa | DELETE /api/tasks/:id | ObjectId inexistente | 404 | | | |
| Negativa | GET /api/tasks | Atlas no disponible | 503 | | | |
| Regresión | PATCH /api/tasks/:id/complete | sin cuerpo | 200 | | | |
| Regresión | PATCH /api/tasks/:id/status | {"completed":false} | 200 | | | |
| Regresión | GET /api/tasks/:id después de DELETE | sin cuerpo | 404 TASK_NOT_FOUND | | | |
| Regresión | GET /ruta-inexistente | sin cuerpo | 404 ROUTE_NOT_FOUND | | | |

## Evidencias

1. Compilación correcta.
2. Documento antes y después de PATCH en Atlas.
3. Respuesta 204 sin cuerpo.
4. Error de validación con requestId.
5. Consulta después de reiniciar.

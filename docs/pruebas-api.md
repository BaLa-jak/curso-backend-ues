# Pruebas de Task API

## Flujo principal

| Método | Ruta | Datos enviados | Esperado | Obtenido | Resultado |
|---|---|---|---:|---:|---|
| GET | /health | No aplica | 200 | 200 | Aprobada |
| GET | /api/tasks | No aplica | 200 | 200 | Aprobada |
| POST | /api/tasks | `{"title":"Documentar mi primera API"}` | 201 | 201 | Aprobada |
| GET | /api/tasks/3 | No aplica | 200 | 200 | Aprobada |
| PATCH | /api/tasks/3 (desafío) | `{"title":"Documentar mi primera API con Express"}` | 200 | 200 | Aprobada |
| PATCH | /api/tasks/3/complete | No aplica | 200 | 200 | Aprobada |
| DELETE | /api/tasks/3 | No aplica | 204 | 204 | Aprobada |
| GET | /api/tasks/3 | No aplica (tarea ya eliminada) | 404 | 404 | Aprobada |

## Pruebas negativas

| Método | Ruta | Datos enviados | Esperado | Obtenido | Resultado |
|---|---|---|---:|---:|---|
| POST | /api/tasks | `{"title":""}` | 400 | 400 | Aprobada |
| GET | /api/tasks/abc | No aplica | 400 | 400 | Aprobada |
| GET | /ruta-inexistente | No aplica | 404 | 404 | Aprobada |
| PATCH | /api/tasks/1 (desafío) | `{"title":"   "}` | 400 | 400 | Aprobada |
| PATCH | /api/tasks/999 (desafío) | `{"title":"Valido"}` | 404 | 404 | Aprobada |
| POST | /api/tasks | Sin cuerpo | 400 | 400 | Aprobada |

## Verificación de la compilación

| Comando | Resultado esperado | Resultado obtenido |
|---|---|---|
| `pnpm check` | Sin errores de TypeScript | Sin errores |
| `pnpm build` | Genera `dist/` sin errores | Generado correctamente |
| `pnpm start` (sobre `dist/`) | `GET /health` y `GET /api/tasks` responden igual que con `pnpm dev` | Respuestas idénticas (200 en ambos casos) |

Todas las pruebas se ejecutaron con `curl` contra `http://localhost:3000` en local; las mismas solicitudes están disponibles en la colección de Postman `docs/Task-API-EC1-F2-A3.postman_collection.json` para reproducirlas.

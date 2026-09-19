# Task API — EC1 F3 A4

API REST construida con Express y TypeScript para administrar tareas. Los datos se guardan en un arreglo en memoria: al reiniciar el servidor regresan a su estado inicial.

Esta versión (EC1 F3 A4) fortalece la API de EC1 F2 A3 con validación reutilizable mediante middleware, un identificador por solicitud y un manejo centralizado de errores con estructura uniforme.

## Requisitos

- Node.js
- PNPM
- Visual Studio Code
- Git

## Instalación

```bash
pnpm install
```

Copie `.env.example` como `.env` y ajuste `PORT` si es necesario.

## Ejecución

```bash
pnpm dev      # desarrollo, con recarga automática (tsx watch)
pnpm check    # verifica tipos de TypeScript sin compilar
pnpm build    # compila src/ a dist/
pnpm start    # ejecuta la versión compilada (node dist/server.js)
```

## Endpoints

| Método | Ruta | Descripción | Código |
|---|---|---|---:|
| GET | `/health` | Confirma que el servidor está disponible | 200 |
| GET | `/api/tasks` | Devuelve todas las tareas | 200 |
| GET | `/api/tasks/:id` | Devuelve una tarea por id | 200 / 400 / 404 |
| POST | `/api/tasks` | Crea una tarea a partir de `{ "title": string }` | 201 / 415 / 422 |
| PATCH | `/api/tasks/:id` | Edita el título de una tarea (`{ "title": string }`) | 200 / 400 / 404 / 415 / 422 |
| PATCH | `/api/tasks/:id/complete` | Marca una tarea como `completed` | 200 / 400 / 404 |
| PATCH | `/api/tasks/:id/status` | Cambia el estado con `{ "completed": boolean }` | 200 / 400 / 404 / 415 / 422 |
| DELETE | `/api/tasks/:id` | Elimina una tarea | 204 / 400 / 404 |

Todas las rutas con `:id` validan el identificador antes de llegar al controlador (`400 INVALID_ID` si no es un entero positivo). Cualquier ruta no registrada responde `404 ROUTE_NOT_FOUND`.

## Contrato de errores

Toda respuesta de error usa la misma estructura:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "La solicitud contiene datos inválidos.",
    "details": [{ "field": "title", "message": "Debe ser texto no vacío." }],
    "requestId": "..."
  }
}
```

| Estado | Código de la API | Uso |
|---|---|---|
| 400 | `INVALID_ID` / `INVALID_JSON` | El identificador o el JSON no puede interpretarse. |
| 404 | `TASK_NOT_FOUND` / `ROUTE_NOT_FOUND` | El recurso o la ruta no existe. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Una ruta con cuerpo no declara `application/json`. |
| 422 | `VALIDATION_ERROR` | El JSON es válido, pero sus campos no cumplen las reglas. |
| 500 | `INTERNAL_ERROR` | Ocurrió un fallo no previsto (sin exponer detalles internos). |

Cada respuesta incluye el encabezado `X-Request-Id`, que coincide con `error.requestId` cuando la solicitud falla, para relacionarla con el registro del servidor.

## Estructura

```
src/
├── app.ts                          # configura Express (sin abrir el puerto)
├── server.ts                       # carga el entorno y abre el puerto
├── controllers/                    # coordina la petición y construye la respuesta
├── data/                           # colección de tareas en memoria
├── errors/                         # AppError (statusCode, code, details)
├── middlewares/
│   ├── request-context.middleware.ts     # genera el requestId (X-Request-Id)
│   ├── require-json.middleware.ts        # exige Content-Type application/json
│   ├── validate-task-id.middleware.ts    # valida :id vía router.param
│   ├── validate-task-title.middleware.ts # valida y normaliza title
│   ├── validate-completion.middleware.ts # valida completed (desafío)
│   ├── not-found.middleware.ts           # delega ROUTE_NOT_FOUND al error handler
│   └── error.middleware.ts               # manejador central de errores
├── models/                         # interfaz Task
├── routes/                         # define los endpoints y encadena los middlewares
└── services/                       # reglas de negocio, independientes de Express
```

## Documentación y evidencias

- `docs/pruebas-api.md` — registro de pruebas manuales de EC1 F2 A3.
- `docs/reflexion.md` — respuestas a las preguntas de cierre de EC1 F2 A3.
- `docs/pruebas-validacion.md` — evidencia de las pruebas de validación y errores de EC1 F3 A4 (400, 404, 415, 422, 500, regresión y desafío).
- `docs/reflexion-validacion.md` — respuestas a las preguntas de cierre de EC1 F3 A4.
- `docs/Task-API-EC1-F2-A3.postman_collection.json` — colección de Postman de EC1 F2 A3.
- `docs/Task-API-EC1-F3-A4.postman_collection.json` — colección de Postman de EC1 F3 A4, con el flujo principal, las pruebas negativas del contrato de errores y el desafío individual `PATCH /api/tasks/:id/status`.

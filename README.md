# Task API — EC1 F2 A3

API REST construida con Express y TypeScript para administrar tareas. Los datos se guardan en un arreglo en memoria: al reiniciar el servidor regresan a su estado inicial.

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
| POST | `/api/tasks` | Crea una tarea a partir de `{ "title": string }` | 201 / 400 |
| PATCH | `/api/tasks/:id` | Edita el título de una tarea (`{ "title": string }`) | 200 / 400 / 404 |
| PATCH | `/api/tasks/:id/complete` | Marca una tarea como `completed` | 200 / 400 / 404 |
| DELETE | `/api/tasks/:id` | Elimina una tarea | 204 / 400 / 404 |

## Estructura

```
src/
├── app.ts                  # configura Express (sin abrir el puerto)
├── server.ts                # carga el entorno y abre el puerto
├── controllers/              # traduce la solicitud HTTP y llama al servicio
├── data/                     # colección de tareas en memoria
├── errors/                   # AppError, para errores esperados con código HTTP
├── middlewares/               # notFound y errorHandler
├── models/                   # interfaz Task
├── routes/                   # define los endpoints del contrato
└── services/                  # reglas de negocio, independientes de Express
```

## Documentación y evidencias

- `docs/pruebas-api.md` — registro de pruebas manuales realizadas.
- `docs/reflexion.md` — respuestas a las preguntas de cierre de la guía.
- `docs/Task-API-EC1-F2-A3.postman_collection.json` — colección de Postman importable con el flujo principal, el desafío y las pruebas negativas.

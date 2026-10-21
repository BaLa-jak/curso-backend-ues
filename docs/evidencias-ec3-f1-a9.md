# Evidencias EC3 F1 A9

## Datos generales

- Nombre: Elias Rosell
- Grupo:
- Repositorio y rama: task-api-express, rama `ec3-a9-auth` (creada desde `feature/consultas-paginadas`, que contiene A8)
- Commit final: 53fb245 (código); este archivo se agrega en el commit de documentación siguiente

## Entorno verificado

- `node --version`: v24.19.0
- `pnpm --version`: 11.24.0
- Dependencias nuevas: bcryptjs 3.0.3 y jose 6.2.12 (versiones exactas); Mongoose se conserva en 8.24.4
- `pnpm check`: aprobado
- `pnpm build`: aprobado; `dist/` contiene `services/auth.service.js`, `services/password.service.js`, `services/token.service.js`, `repositories/user.repository.js`, `models/user.js`, `middlewares/validate-auth.middleware.js` y `routes/auth.routes.js`
- `GET /health/database`: 200, `{"data":{"database":{"status":"connected"}}}` (requestId 460e09e1-a9ee-4345-b5c6-b431ff754cac)
- `.env`: ignorado por `.gitignore`; `JWT_SECRET` generado con `randomBytes(32)` (64 caracteres hexadecimales) y nunca mostrado ni confirmado
- Arranque con `JWT_SECRET` de menos de 32 bytes: la API no inicia y solo muestra `JWT_SECRET debe contener al menos 32 bytes.`
- Fecha de ejecución: 2026-10-21, API compilada (`node dist/server.js`) conectada a Atlas

## Registro

- Solicitud utilizada:

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ana Torres",
  "email": "ana.torres@example.com",
  "password": "<OCULTA>",
  "confirmPassword": "<OCULTA>"
}
```

- Código HTTP: 201. El correo exacto de la guía se registró en la primera corrida, que no guardó su requestId. La corrida documentada registró `ana.torres+<marca>@example.com` con el mismo cuerpo (requestId e9f28534-9d72-4987-ae62-073e99add6e1). Después, el login con `ana.torres@example.com` también respondió 200.
- Respuesta sin datos sensibles:

```json
{
  "data": {
    "user": {
      "id": "<ObjectId>",
      "name": "Ana Torres",
      "email": "ana.torres@example.com",
      "role": "user",
      "createdAt": "2026-10-21T…",
      "updatedAt": "2026-10-21T…"
    }
  }
}
```

- Comprobación de que no aparece `passwordHash`: la respuesta solo tiene `createdAt, email, id, name, role, updatedAt`; el texto completo de la respuesta no contiene `password` ni un prefijo bcrypt.
- Correo en mayúsculas `Luis.Rios+…@Example.COM`: la respuesta y MongoDB lo guardan en minúsculas; el nombre `"  Luis Ríos  "` se guarda recortado como `Luis Ríos` (requestId 04060814-235f-4282-ab55-dca727b3f9a8). El login con el correo totalmente en mayúsculas responde 200 (requestId 6023063b-a922-42d5-9f37-bc410f4b8104).

## Inicio de sesión

- Solicitud:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ana.torres@example.com",
  "password": "<OCULTA>"
}
```

- Código HTTP: 200 (requestId 7861ff5a-4f1a-4701-8f20-76ecd5fb5169)
- Campos recibidos:

```json
{
  "data": {
    "user": { "id": "…", "name": "Ana Torres", "email": "ana.torres@example.com", "role": "user", "createdAt": "…", "updatedAt": "…" },
    "accessToken": "<TOKEN_OCULTO>",
    "tokenType": "Bearer",
    "expiresIn": "1h"
  }
}
```

- Claims observados sin copiar el token (decodificación solo para inspección):
  - Encabezado: `{"alg":"HS256","typ":"JWT"}`
  - Claims: `sub` (igual al `id` del usuario), `role: "user"`, `iss: "task-api-express"`, `aud: "task-api-client"`, `iat`, `exp`; `exp - iat = 3600` s, que coincide con `JWT_EXPIRES_IN=1h`
  - No contiene contraseña, hash, nombre ni correo
- Verificación con `verifyAccessToken`: el token válido devuelve `{ userId, role: "user" }`. Tres tokens alterados se rechazan con 401 `INVALID_TOKEN`: payload cambiado a `role: "admin"` con la firma original, firma modificada y un texto que no es JWT.

## Pruebas negativas

| Caso | Código esperado | Código obtenido | `error.code` | Resultado |
|---|---:|---:|---|---|
| Correo repetido | 409 | 409 | USER_EMAIL_EXISTS | Aprobado (718ed0c8-543e-43ad-b8aa-96f664bb196b) |
| Contraseña corta | 422 | 422 | AUTH_VALIDATION_ERROR | Aprobado; details: `password` (ddf11822-ae28-4be0-9c38-0c82ff01ebfe) |
| Campo `role` | 422 | 422 | AUTH_VALIDATION_ERROR | Aprobado; details: `role` no permitido; el usuario no se creó (1a91ea95-f48e-402a-a6f6-570f97a9291e) |
| Credenciales incorrectas: contraseña equivocada | 401 | 401 | INVALID_CREDENTIALS | Aprobado (dcaf6a8e-ea30-4dce-9411-014ec236fa45) |
| Credenciales incorrectas: correo inexistente | 401 | 401 | INVALID_CREDENTIALS | Aprobado; mismo code y message que la contraseña equivocada (4ac08a96-1fa3-45e5-a495-50cf83e8de17) |
| Content-Type incorrecto | 415 | 415 | UNSUPPORTED_MEDIA_TYPE | Aprobado (42f4218c-e486-41c2-8cca-da8e8f637fbc) |
| JSON inválido | 400 | 400 | INVALID_JSON | Aprobado (74d9a5b9-d8b9-4dd4-8dd2-54e6ec288a86) |
| Contraseña de más de 72 bytes (40 × `ñ` = 80 bytes) | 422 | 422 | AUTH_VALIDATION_ERROR | Aprobado; "No debe superar 72 bytes en UTF-8." (9169187d-045c-44a4-ade8-c69f7c271d28) |
| Correo inválido | 422 | 422 | AUTH_VALIDATION_ERROR | Aprobado; details: `email` (d37b467e-83ee-4257-959f-f0459838ce88) |
| Campo adicional `passwordHash` en registro | 422 | 422 | AUTH_VALIDATION_ERROR | Aprobado; details: `passwordHash` no permitido (d9c1d7ed-d377-434d-a858-1191b8a8a768) |
| Campo adicional `name` en login | 422 | 422 | AUTH_VALIDATION_ERROR | Aprobado (684a377a-c058-4ad0-91e1-a9c2ee702e7c) |
| Cuerpo que no es objeto (`[1,2]`) | 422 | 422 | AUTH_VALIDATION_ERROR | Aprobado; details: `body` (4206df63-5ad3-4e3a-ae86-6182b3ae9e13) |

## Desafío: confirmPassword

| Caso | Código esperado | Código obtenido | `error.code` | Resultado |
|---|---:|---:|---|---|
| Contraseñas coincidentes | 201 | 201 | — | Aprobado (registro P1) |
| Contraseñas diferentes | 422 | 422 | AUTH_VALIDATION_ERROR | Aprobado; details solo `confirmPassword`: "Debe coincidir con password." (6311449e-1fb3-4628-8b83-9891a4bbef3a) |
| Sin confirmPassword | 422 | 422 | AUTH_VALIDATION_ERROR | Aprobado; details `confirmPassword`: "Debe ser texto." (8968e8db-b84b-4bf3-b89d-a608ba29e689) |

- En MongoDB, `countDocuments({ confirmPassword: { $exists: true } })` en la colección `users` devuelve 0.
- Login y CRUD de tareas siguen funcionando (ver la sección siguiente).
- Por qué pertenece a la frontera HTTP: confirmPassword solo sirve para detectar un error de escritura del usuario en el formulario. Una vez comprobado que coincide no aporta información nueva, así que no es un dato del usuario. Por eso `validateRegister` lo exige, lo compara y no lo copia a `RegisterInput`; el servicio, el repositorio, el modelo y la respuesta no lo conocen. Guardarlo en el modelo duplicaría la contraseña, y si fuera en texto plano rompería la regla de almacenar solo el hash.

## Regresión de tareas

Todas sin encabezado `Authorization`:

- Listar con paginación: `GET /api/tasks?page=1&limit=5` → 200, `meta.limit` 5, total 9 (a9a97cf1-13b9-4159-ba35-66e526ee4567)
- Crear: `POST /api/tasks` `{"title":"Probar A9"}` → 201 (c761869a-9928-4454-8e8d-938060d95fde)
- Actualizar: `PATCH /api/tasks/:id` con `title` → 200 (f7d779ba-cd14-40e8-810e-62cf0c8bdb0a)
- Completar: `PATCH /api/tasks/:id/complete` → 200, status completed (d514093e-9966-4805-9101-9e88ff6a1e91)
- Listar con filtros: `GET /api/tasks?status=completed&search=A9&sortBy=title&order=asc` → 200, total 1, solo completed (2f76f3bb-c352-4174-b379-1f9007ea7041)
- Eliminar: `DELETE /api/tasks/:id` → 204 sin cuerpo (4f06cf2b-8ad8-4045-9479-baa4a53a4987)
- Errores conservados, con requestId:
  - tarea eliminada → 404 `TASK_NOT_FOUND` (baa2505b-baa8-4e6d-9c0b-772bc115223a)
  - `limit=51` → 422 `QUERY_VALIDATION_ERROR` (fd5d20a4-5d35-472d-ba28-80921ab98419)
  - id `abc` → 400 `INVALID_ID` (6b6dbb6c-871c-43fb-9ecf-b4379c71dbf1)
- `GET /health` → 200 (936dfa11-e32d-4f5c-9c6a-b1c302b8102d); la respuesta ya no incluye `X-Powered-By`.

## Seguridad observada

La revisión de la colección `users` se hizo con un script que solo imprime comparaciones y prefijos, nunca documentos completos.

- ¿La colección guarda `password` o solo `passwordHash`?
  - Solo `passwordHash`, con prefijo `$2b$12$` (bcrypt, 12 rondas). No existe el campo `password` y el hash no coincide con la contraseña.
  - Dos usuarios con la misma contraseña tienen hashes distintos por la sal aleatoria.
  - Los documentos no tienen `__v`. La colección tiene el índice `email` único.
- ¿Alguna respuesta expone `passwordHash`, URI, secreto o stack trace?
  - No. Ninguna respuesta de registro ni de login contiene `password` ni un prefijo bcrypt.
  - Los errores usan el contrato `code`, `message`, `details` y `requestId`.
- ¿El cliente puede asignarse `admin`?
  - No. `role` se rechaza con 422 y el usuario no se crea.
  - La colección tiene 0 usuarios admin.
  - Un token alterado a `role: "admin"` falla la verificación de firma.

## Conclusión

Se comprobó lo siguiente:

- El registro guarda solo un hash bcrypt, normaliza el correo y siempre asigna el rol `user`.
- El login responde igual ante un correo inexistente y ante una contraseña equivocada, y emite un JWT HS256 con `sub`, `role`, `iss`, `aud` y una expiración de 1 h.
- `verifyAccessToken` rechaza los tokens alterados.
- El CRUD y las consultas de A8 siguen funcionando sin token.

Queda pendiente para A10:

- un middleware que lea `Authorization: Bearer`, use `verifyAccessToken` y guarde la identidad en la solicitud;
- la protección de `/api/tasks`;
- los permisos por rol.

Nota: las corridas de prueba dejaron cuatro usuarios de práctica con correos `@example.com` en la colección `users`.

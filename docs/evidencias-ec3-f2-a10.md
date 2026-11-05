# EC3 F2 A10 - Autenticación y autorización

## Datos

- Nombre: [tu nombre]
- Rama: ec3-a10-proteccion
- Commit final: [hash]

## Decisión de permisos

- Rutas autenticadas: [lista]
- Ruta exclusiva de admin: [ruta]
- Justificación: [explicación]

## Pruebas

| Caso                  | Código esperado | Código obtenido | requestId | Evidencia |
| --------------------- | --------------: | --------------: | --------- | --------- |
| Tareas sin token      |             401 |             [ ] | [ ]       | [archivo] |
| Encabezado inválido   |             401 |             [ ] | [ ]       | [archivo] |
| Usuario elimina       |             403 |             [ ] | [ ]       | [archivo] |
| Admin elimina         |             204 |             [ ] | no aplica | [archivo] |
| Límite superado       |             429 |             [ ] | [ ]       | [archivo] |
| Regresión de consulta |             200 |             [ ] | [ ]       | [archivo] |

## CORS y cabeceras

- Origen configurado: [origen sin secretos]
- Access-Control-Allow-Origin permitido: [valor]
- Cabecera Helmet observada: [nombre y valor]

## Preguntas de cierre

1. ¿Por qué un token decodificable no necesariamente es un token válido?
2. ¿Cuándo corresponde responder 401 y cuándo 403?
3. ¿Por qué CORS no sustituye la autenticación?
4. ¿Qué riesgo existe si DELETE se registra antes de requireRole?
5. ¿Por qué debes iniciar sesión después de cambiar el rol en MongoDB?
6. ¿Cómo llega un error asíncrono de authenticate al errorHandler en Express 5?
7. ¿Qué limitación tiene el almacén en memoria del rate limiter al escalar la API?
8. ¿Qué cambios requeriría autorizar por propietario de la tarea?

## Reflexión

[Describe qué error te ayudó a comprender mejor el flujo.]

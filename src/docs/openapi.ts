// Contrato OpenAPI 3.1 de la API. Describe el comportamiento; la validación real vive en los middlewares.
const json = (schema: Record<string, unknown>) => ({
  'application/json': { schema },
});

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const response = (name: string) => ({ $ref: `#/components/responses/${name}` });
const bearer = [{ bearerAuth: [] }];

export const openApiDocument: Record<string, unknown> = {
  openapi: '3.1.0',
  info: {
    title: 'Task API Express',
    version: '1.0.0',
    description: 'API REST para gestionar tareas con autenticación JWT y autorización por roles.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Entorno local' }],
  tags: [
    { name: 'Health', description: 'Comprobación del servicio' },
    { name: 'Auth', description: 'Registro, acceso e identidad autenticada' },
    { name: 'Tasks', description: 'CRUD protegido de tareas' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Comprobar que la API responde',
        responses: {
          '200': {
            description: 'Servicio disponible',
            content: json({
              type: 'object',
              required: ['data'],
              properties: {
                data: {
                  type: 'object',
                  required: ['status'],
                  properties: { status: { type: 'string', const: 'up' } },
                },
              },
            }),
          },
        },
      },
    },
    '/health/database': {
      get: {
        tags: ['Health'],
        summary: 'Comprobar la conexión con MongoDB',
        responses: {
          '200': {
            description: 'Base de datos conectada',
            content: json({
              type: 'object',
              required: ['data'],
              properties: {
                data: {
                  type: 'object',
                  required: ['database'],
                  properties: {
                    database: {
                      type: 'object',
                      required: ['status'],
                      properties: { status: { type: 'string', const: 'connected' } },
                    },
                  },
                },
              },
            }),
          },
          '503': response('ServiceUnavailable'),
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar una cuenta de usuario',
        requestBody: { required: true, content: json(ref('RegisterInput')) },
        responses: {
          '201': { description: 'Cuenta creada', content: json(ref('UserEnvelope')) },
          '400': response('BadRequest'),
          '409': response('Conflict'),
          '415': response('UnsupportedMediaType'),
          '422': response('ValidationError'),
          '429': response('RateLimited'),
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Iniciar sesión y obtener un access token',
        requestBody: { required: true, content: json(ref('LoginInput')) },
        responses: {
          '200': { description: 'Credenciales correctas', content: json(ref('LoginEnvelope')) },
          '400': response('BadRequest'),
          '401': response('Unauthorized'),
          '415': response('UnsupportedMediaType'),
          '422': response('ValidationError'),
          '429': response('RateLimited'),
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Obtener el usuario asociado al token',
        security: bearer,
        responses: {
          '200': { description: 'Identidad autenticada', content: json(ref('UserEnvelope')) },
          '401': response('Unauthorized'),
        },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Listar tareas con paginación, filtros y ordenamiento',
        security: bearer,
        parameters: ['Page', 'Limit', 'Status', 'Search', 'CreatedFrom', 'CreatedTo', 'SortBy', 'Order'].map(
          (name) => ({ $ref: `#/components/parameters/${name}` }),
        ),
        responses: {
          '200': { description: 'Lista paginada', content: json(ref('TaskListResult')) },
          '401': response('Unauthorized'),
          '422': response('ValidationError'),
        },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Crear una tarea',
        security: bearer,
        requestBody: { required: true, content: json(ref('CreateTaskInput')) },
        responses: {
          '201': { description: 'Tarea creada', content: json(ref('TaskEnvelope')) },
          '400': response('BadRequest'),
          '401': response('Unauthorized'),
          '415': response('UnsupportedMediaType'),
          '422': response('ValidationError'),
        },
      },
    },
    '/api/tasks/{id}': {
      parameters: [{ $ref: '#/components/parameters/TaskId' }],
      get: {
        tags: ['Tasks'],
        summary: 'Consultar una tarea',
        security: bearer,
        responses: {
          '200': { description: 'Tarea encontrada', content: json(ref('TaskEnvelope')) },
          '400': response('BadRequest'),
          '401': response('Unauthorized'),
          '404': response('NotFound'),
        },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Modificar título, descripción o estado de una tarea',
        security: bearer,
        requestBody: { required: true, content: json(ref('UpdateTaskInput')) },
        responses: {
          '200': { description: 'Tarea modificada', content: json(ref('TaskEnvelope')) },
          '400': response('BadRequest'),
          '401': response('Unauthorized'),
          '404': response('NotFound'),
          '415': response('UnsupportedMediaType'),
          '422': response('ValidationError'),
        },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Eliminar una tarea como administrador',
        security: bearer,
        responses: {
          '204': { description: 'Tarea eliminada' },
          '400': response('BadRequest'),
          '401': response('Unauthorized'),
          '403': response('Forbidden'),
          '404': response('NotFound'),
        },
      },
    },
    '/api/tasks/{id}/complete': {
      parameters: [{ $ref: '#/components/parameters/TaskId' }],
      patch: {
        tags: ['Tasks'],
        summary: 'Marcar una tarea como completada',
        security: bearer,
        responses: {
          '200': { description: 'Tarea completada', content: json(ref('TaskEnvelope')) },
          '400': response('BadRequest'),
          '401': response('Unauthorized'),
          '404': response('NotFound'),
        },
      },
    },
    '/api/tasks/{id}/status': {
      parameters: [{ $ref: '#/components/parameters/TaskId' }],
      patch: {
        tags: ['Tasks'],
        summary: 'Cambiar el estado con un valor booleano',
        security: bearer,
        requestBody: { required: true, content: json(ref('TaskCompletionInput')) },
        responses: {
          '200': { description: 'Estado actualizado', content: json(ref('TaskEnvelope')) },
          '400': response('BadRequest'),
          '401': response('Unauthorized'),
          '404': response('NotFound'),
          '415': response('UnsupportedMediaType'),
          '422': response('ValidationError'),
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    parameters: {
      TaskId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
      },
      Page: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 100_000, default: 1 },
      },
      Limit: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      },
      Status: {
        name: 'status',
        in: 'query',
        schema: { type: 'string', enum: ['pending', 'completed'] },
      },
      Search: {
        name: 'search',
        in: 'query',
        schema: { type: 'string', minLength: 1, maxLength: 60 },
      },
      CreatedFrom: {
        name: 'createdFrom',
        in: 'query',
        description: 'Fecha ISO 8601; no debe ser posterior a createdTo.',
        schema: { type: 'string', format: 'date-time' },
      },
      CreatedTo: {
        name: 'createdTo',
        in: 'query',
        schema: { type: 'string', format: 'date-time' },
      },
      SortBy: {
        name: 'sortBy',
        in: 'query',
        schema: {
          type: 'string',
          enum: ['createdAt', 'updatedAt', 'title', 'status'],
          default: 'createdAt',
        },
      },
      Order: {
        name: 'order',
        in: 'query',
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', example: '67112bfe47963b2be12c43a1' },
          name: { type: 'string', example: 'Ana Torres' },
          email: { type: 'string', format: 'email', example: 'ana.torres@example.com' },
          role: { type: 'string', enum: ['user', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Task: {
        type: 'object',
        required: ['id', 'title', 'status', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', example: '67112bfe47963b2be12c43b1' },
          title: { type: 'string', example: 'Documentar la API' },
          description: { type: 'string', example: 'Publicar Swagger UI' },
          status: { type: 'string', enum: ['pending', 'completed'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password', 'confirmPassword'],
        additionalProperties: false,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 80 },
          email: { type: 'string', format: 'email', maxLength: 254 },
          password: {
            type: 'string',
            minLength: 15,
            format: 'password',
            description: 'Máximo 72 bytes en UTF-8.',
          },
          confirmPassword: { type: 'string', format: 'password' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' },
        },
      },
      CreateTaskInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 120 },
          description: { type: 'string', maxLength: 300 },
        },
      },
      UpdateTaskInput: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 120 },
          description: { type: 'string', maxLength: 300 },
          status: { type: 'string', enum: ['pending', 'completed'] },
        },
      },
      TaskCompletionInput: {
        type: 'object',
        required: ['completed'],
        properties: { completed: { type: 'boolean' } },
      },
      ErrorDetail: {
        type: 'object',
        additionalProperties: true,
        properties: {
          field: { type: 'string' },
          message: { type: 'string' },
        },
      },
      ApiError: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: { type: 'string', example: 'VALIDATION_ERROR' },
          message: { type: 'string', example: 'La solicitud contiene datos inválidos.' },
          details: { type: 'array', items: ref('ErrorDetail') },
          requestId: { type: 'string', format: 'uuid' },
        },
      },
      ErrorEnvelope: {
        type: 'object',
        required: ['error'],
        properties: { error: ref('ApiError') },
      },
      UserEnvelope: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'object',
            required: ['user'],
            properties: { user: ref('User') },
          },
        },
      },
      LoginEnvelope: {
        type: 'object',
        required: ['data'],
        properties: {
          data: {
            type: 'object',
            required: ['user', 'accessToken', 'tokenType', 'expiresIn'],
            properties: {
              user: ref('User'),
              accessToken: { type: 'string' },
              tokenType: { type: 'string', const: 'Bearer' },
              expiresIn: { type: 'string', example: '1h' },
            },
          },
        },
      },
      TaskEnvelope: {
        type: 'object',
        required: ['data'],
        properties: { data: ref('Task') },
      },
      PaginationMeta: {
        type: 'object',
        required: ['page', 'limit', 'total', 'totalPages', 'hasNextPage', 'hasPreviousPage'],
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
          hasNextPage: { type: 'boolean' },
          hasPreviousPage: { type: 'boolean' },
        },
      },
      TaskListResult: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: { type: 'array', items: ref('Task') },
          meta: ref('PaginationMeta'),
        },
      },
    },
    responses: Object.fromEntries(
      [
        ['BadRequest', 'Identificador con formato inválido (INVALID_ID) o JSON mal formado (INVALID_JSON)'],
        ['Unauthorized', 'Token ausente, inválido, vencido o sin cuenta asociada'],
        ['Forbidden', 'El rol autenticado no tiene permiso'],
        ['NotFound', 'Recurso inexistente'],
        ['Conflict', 'Conflicto con un recurso existente'],
        ['UnsupportedMediaType', 'El cuerpo no utiliza application/json'],
        ['ValidationError', 'Parámetros o cuerpo inválidos'],
        ['RateLimited', 'Se superó el límite temporal de autenticación'],
        ['ServiceUnavailable', 'La base de datos no está disponible'],
      ].map(([name, description]) => [
        name,
        { description, content: json(ref('ErrorEnvelope')) },
      ]),
    ),
  },
};

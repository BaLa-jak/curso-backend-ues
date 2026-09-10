# Reflexión — EC1 F1 A2

**Nombre:**  
**Grupo:**  

## 1. Función de Node.js

Node.js es el entorno de ejecución que permite correr JavaScript (y TypeScript compilado) fuera del navegador, directamente en el servidor o la terminal. En este proyecto, Node.js ejecuta la lógica de la aplicación de consola: lee variables de entorno con `process.env`, maneja módulos ECMAScript y da acceso a las APIs del sistema operativo como `setTimeout`.

## 2. Aportes de TypeScript

TypeScript detecta antes de ejecutar errores como: pasar un valor del tipo incorrecto a una función (por ejemplo, un `string` donde se espera `number`), acceder a una propiedad que no existe en una interfaz, olvidar manejar el caso `undefined` (gracias a `noUncheckedIndexedAccess`), o usar un `TaskStatus` inválido que no sea `'pending'` ni `'completed'`.

## 3. Separación en models, data, services y utils

Cada carpeta tiene una responsabilidad única:
- **models**: define la *forma* de los datos (qué campos tiene una `Task`).
- **data**: mantiene la colección en memoria; es el único lugar donde vive el arreglo `tasks`.
- **services**: concentra las *reglas de negocio* (cómo crear, completar o eliminar tareas).
- **utils**: contiene funciones reutilizables sin lógica de dominio (`delay`, `getAppName`).

Esta separación facilita el mantenimiento: si cambia la fuente de datos (de memoria a base de datos), solo se modifica `data/`; si cambia una regla, solo se modifica `services/`.

## 4. Diferencia entre función síncrona y async

Una función **síncrona** bloquea la ejecución hasta que termina (por ejemplo, `createTask` devuelve la tarea de inmediato). Una función **async** devuelve una `Promise` y puede usar `await` para esperar el resultado de una operación asíncrona sin bloquear. En el proyecto, `main` es `async` porque usa `await delay(300)` para simular una espera sin detener el hilo principal.

## 5. Por qué findTaskById devuelve Task | undefined

Porque una búsqueda en un arreglo puede *no encontrar* el elemento. TypeScript con `strict` no permite ignorar ese caso: si la función devolviera solo `Task`, el compilador asumiría que siempre existe una tarea con ese id, lo que sería incorrecto. Retornar `Task | undefined` obliga a quien usa la función a verificar el resultado antes de operar sobre él.

## 6. Ventaja de leer APP_NAME desde process.env

Permite **configurar el comportamiento de la aplicación sin modificar el código fuente**. En producción se puede cambiar el nombre de la app, una URL de conexión o un nivel de log simplemente estableciendo una variable de entorno, sin recompilar ni tocar el repositorio. Esto también evita exponer valores sensibles (contraseñas, tokens) en el código.

## 7. Diferencia entre pnpm start y pnpm build + pnpm serve

- `pnpm start` usa **TSX**, que interpreta el TypeScript directamente sin generar archivos; es ideal para desarrollo porque es más rápido de iniciar.
- `pnpm build` compila TypeScript a JavaScript en la carpeta `dist/`, y `pnpm serve` ejecuta ese JavaScript con Node.js puro. Este flujo representa lo que ocurriría en un entorno de producción real, donde no se instala TypeScript en el servidor.

## 8. Parte reutilizable en la futura API con Express

Los módulos **models**, **data** y **services** se reutilizarán directamente: la interfaz `Task`, la colección en memoria y las funciones `listTasks`, `createTask`, `completeTask`, `deleteTask` y `listPendingTasks`. En la siguiente actividad, los controladores de Express llamarán a esas mismas funciones para responder peticiones HTTP, sin tener que reescribir la lógica de dominio.

import {
  createTask,
  completeTask,
  listTasks,
  deleteTask,
  listPendingTasks,
} from './services/task.service.js';
import { delay } from './utils/delay.js';
import { getAppName } from './utils/env.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

const showTasks = (): void => {
  const rows = listTasks().map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    createdAt: task.createdAt.toLocaleString(),
  }));

  console.table(rows);
};

const showPendingTasks = (): void => {
  const rows = listPendingTasks().map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    createdAt: task.createdAt.toLocaleString(),
  }));

  console.table(rows);
};

// ── Punto de entrada ─────────────────────────────────────────────────────────

const main = async (): Promise<void> => {
  console.log(`\n${getAppName()}`);
  console.log('Iniciando aplicación...');
  await delay(300);

  // Tareas iniciales
  console.log('\nTareas iniciales');
  showTasks();

  // Crear y completar una tarea
  const newTask = createTask('Construir mi primer servicio');
  console.log(`Tarea creada con id ${newTask.id}.`);

  completeTask(newTask.id);
  console.log(`Tarea ${newTask.id} completada.`);

  // Estado final
  console.log('\nEstado final');
  showTasks();

  // Error controlado — completeTask con id inexistente
  try {
    completeTask(999);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    console.error(`Error controlado: ${message}`);
  }

  // ── Desafío individual ─────────────────────────────────────────────────────

  console.log('\n── Desafío ──────────────────────────────────────────────────');

  // deleteTask exitoso
  const taskToDelete = createTask('Tarea temporal para eliminar');
  console.log(`Tarea creada con id ${taskToDelete.id} (se eliminará).`);

  const deleted = deleteTask(taskToDelete.id);
  console.log(`Tarea "${deleted.title}" (id ${deleted.id}) eliminada correctamente.`);

  // deleteTask con id inexistente
  try {
    deleteTask(999);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    console.error(`Error controlado al eliminar: ${message}`);
  }

  // listPendingTasks
  console.log('\nTareas pendientes:');
  showPendingTasks();
};

main().catch((error: unknown) => {
  console.error('Error no controlado:', error);
  process.exitCode = 1;
});

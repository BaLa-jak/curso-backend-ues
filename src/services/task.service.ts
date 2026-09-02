import { tasks } from '../data/tasks.js';
import type { Task } from '../models/task.js';

export const listTasks = (): readonly Task[] => tasks;

export const findTaskById = (id: number): Task | undefined =>
  tasks.find((task) => task.id === id);

export const createTask = (title: string): Task => {
  const cleanTitle = title.trim();

  if (!cleanTitle) {
    throw new Error('El título de la tarea es obligatorio.');
  }

  const nextId = Math.max(0, ...tasks.map((task) => task.id)) + 1;
  const newTask: Task = {
    id: nextId,
    title: cleanTitle,
    status: 'pending',
    createdAt: new Date(),
  };

  tasks.push(newTask);
  return newTask;
};

export const completeTask = (id: number): Task => {
  const task = findTaskById(id);

  if (!task) {
    throw new Error(`No existe una tarea con el id ${id}.`);
  }

  task.status = 'completed';
  return task;
};

export const deleteTask = (id: number): Task => {
  const index = tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    throw new Error(`No existe una tarea con el id ${id}.`);
  }

  const [deleted] = tasks.splice(index, 1);

  if (!deleted) {
    throw new Error(`No existe una tarea con el id ${id}.`);
  }

  return deleted;
};

export const listPendingTasks = (): readonly Task[] =>
  tasks.filter((task) => task.status === 'pending');

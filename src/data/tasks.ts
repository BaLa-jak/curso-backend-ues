import type { Task } from '../models/task.js';

export const tasks: Task[] = [
  {
    id: 1,
    title: 'Configurar el proyecto backend',
    status: 'completed',
    createdAt: new Date(),
  },
  {
    id: 2,
    title: 'Practicar TypeScript',
    status: 'pending',
    createdAt: new Date(),
  },
];

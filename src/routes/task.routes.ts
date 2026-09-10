import { Router } from 'express';
import {
  getTask,
  getTasks,
  patchTaskComplete,
  patchTaskTitle,
  postTask,
  removeTask,
} from '../controllers/task.controller.js';

export const taskRouter = Router();

taskRouter.get('/', getTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', postTask);
taskRouter.patch('/:id/complete', patchTaskComplete);
taskRouter.patch('/:id', patchTaskTitle);
taskRouter.delete('/:id', removeTask);

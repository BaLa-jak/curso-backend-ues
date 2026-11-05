import { Router } from 'express';
import {
  getTask,
  getTasks,
  patchTask,
  patchTaskComplete,
  patchTaskStatus,
  postTask,
  removeTask,
} from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { requireRole } from '../middlewares/authorize.middleware.js';
import { requireJson } from '../middlewares/require-json.middleware.js';
import { validateCompletion } from '../middlewares/validate-completion.middleware.js';
import { validateTaskDescription } from '../middlewares/validate-task-description.middleware.js';
import { validateTaskId } from '../middlewares/validate-task-id.middleware.js';
import { validateTaskQuery } from '../middlewares/validate-task-query.middleware.js';
import { validateTaskTitle } from '../middlewares/validate-task-title.middleware.js';
import { validateTaskUpdate } from '../middlewares/validate-task-update.middleware.js';

export const taskRouter = Router();

// La autenticación va primero: clientes anónimos no llegan a los validadores.
taskRouter.use(authenticate);
taskRouter.param('id', validateTaskId);

taskRouter.get('/', validateTaskQuery, getTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', requireJson, validateTaskTitle, validateTaskDescription, postTask);
taskRouter.patch('/:id/complete', patchTaskComplete);
taskRouter.patch('/:id/status', requireJson, validateCompletion, patchTaskStatus);
taskRouter.patch('/:id', requireJson, validateTaskUpdate, patchTask);
taskRouter.delete('/:id', requireRole('admin'), removeTask);

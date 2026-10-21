import express from 'express';
import { authRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { taskRouter } from './routes/task.routes.js';
import { requestContext } from './middlewares/request-context.middleware.js';
import { notFound } from './middlewares/not-found.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

export const app = express();

app.disable('x-powered-by');
app.use(requestContext);
app.use(express.json({ limit: '20kb' }));

app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
// Las tareas siguen públicas en A9; la protección con token llega en A10.
app.use('/api/tasks', taskRouter);

app.use(notFound);
app.use(errorHandler);

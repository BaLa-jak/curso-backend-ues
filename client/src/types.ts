export type UserRole = 'user' | 'admin';
export type TaskStatus = 'pending' | 'completed';

// Las fechas llegan como string JSON aunque el backend use Date.
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface LoginData {
  user: User;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: string;
}

export interface ApiEnvelope<T> {
  data: T;
}

export interface TaskListResponse {
  data: Task[];
  meta: PaginationMeta;
}

export interface ApiErrorData {
  code: string;
  message: string;
  details?: unknown[];
  requestId?: string;
}

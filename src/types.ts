export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  uid: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  uid: string;
  name: string;
  createdAt: string;
}

export type ViewMode = 'list' | 'board' | 'dashboard' | 'settings' | 'activity';
export type Theme = 'light' | 'dark' | 'system';

export interface ActivityLog {
  id: string;
  uid: string;
  action: string;
  taskId?: string;
  timestamp: string;
  details: string;
}

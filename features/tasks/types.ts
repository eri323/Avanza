import type { IsoDate } from '@/lib/dates';

export type TaskPriority = 'none' | 'low' | 'medium' | 'high';

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  dueDate: IsoDate | null;
  projectId: string | null;
  priority: TaskPriority;
  completedAt: string | null;
};

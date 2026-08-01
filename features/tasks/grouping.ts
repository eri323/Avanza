import { bucketFor, type IsoDate, type TaskBucket } from '@/lib/dates';
import type { Task } from './types';

export type GroupedTasks = Record<TaskBucket, Task[]>;

/**
 * Reparte tareas pendientes en los grupos de la pantalla de tareas.
 *
 * Función pura y separada de la consulta: agrupar en SQL obligaría a conocer
 * el "hoy" del usuario dentro de la base, que es justo lo que no queremos.
 */
export function groupTasks(tasks: Task[], today: IsoDate): GroupedTasks {
  const groups: GroupedTasks = {
    overdue: [],
    today: [],
    upcoming: [],
    someday: [],
  };

  for (const task of tasks) {
    if (task.completedAt !== null) continue;
    groups[bucketFor(task.dueDate, today)].push(task);
  }

  const byDueDate = (a: Task, b: Task) =>
    (a.dueDate ?? '').localeCompare(b.dueDate ?? '');

  groups.overdue.sort(byDueDate);
  groups.upcoming.sort(byDueDate);

  return groups;
}

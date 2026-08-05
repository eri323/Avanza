import type { IsoDate } from '@/lib/dates';
import type { XpPriority } from '@/lib/xp';

/** La misma unión que el enum `task_priority` de la base. Se deriva de
 *  `XpPriority` y no se repite: si las dos divergieran, `xpForTask` devolvería
 *  `undefined` y el XP y el nivel se pintarían como NaN. */
export type TaskPriority = XpPriority;

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  dueDate: IsoDate | null;
  projectId: string | null;
  priority: TaskPriority;
  completedAt: string | null;
};

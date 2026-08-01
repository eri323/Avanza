import 'server-only';

import type { IsoDate } from '@/lib/dates';
import { getTodayForUser } from '@/features/profile';
import { listProjects } from '@/features/projects';
import type { Project } from '@/features/projects/queries';
import { groupTasks, listPendingTasks } from '@/features/tasks';
import type { Task } from '@/features/tasks/types';
import { listHabitsWithProgress } from '@/features/habits';
import type { HabitWithProgress } from '@/features/habits/types';

export type TodayData = {
  today: IsoDate;
  overdue: Task[];
  dueToday: Task[];
  habits: HabitWithProgress[];
  projects: Project[];
};

export async function getTodayData(): Promise<TodayData> {
  const today = await getTodayForUser();

  const [tasks, habits, projects] = await Promise.all([
    listPendingTasks(),
    listHabitsWithProgress(today),
    listProjects(),
  ]);

  const groups = groupTasks(tasks, today);

  return {
    today,
    overdue: groups.overdue,
    dueToday: groups.today,
    habits,
    projects,
  };
}

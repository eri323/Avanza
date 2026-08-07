import { Suspense } from 'react';
import { getTodayForUser } from '@/features/profile';
import { listProjectsWithCounts } from '@/features/projects';
import { listPendingTasks, TaskList } from '@/features/tasks';

/**
 * Vive aquí y no en `page.tsx` porque la Tarea 23 la renderiza también desde
 * `default.tsx`: con las rutas paralelas, la lista se pinta tanto en `/tareas`
 * como en `/tareas/[id]`.
 */
export async function TasksScreen() {
  const [today, tasks, projects] = await Promise.all([
    getTodayForUser(),
    listPendingTasks(),
    listProjectsWithCounts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display text-text">Tareas</h1>
      {/* `useSearchParams` obliga a un límite de Suspense. */}
      <Suspense fallback={null}>
        <TaskList tasks={tasks} projects={projects} today={today} />
      </Suspense>
    </div>
  );
}

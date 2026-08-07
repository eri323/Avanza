import { getTodayForUser } from '@/features/profile';
import { groupTasks, listPendingTasks, TaskItem } from '@/features/tasks';
import type { Task } from '@/features/tasks';

const SECTIONS = [
  { key: 'overdue', label: 'Vencidas' },
  { key: 'today', label: 'Hoy' },
  { key: 'upcoming', label: 'Próximas' },
  { key: 'someday', label: 'Sin fecha' },
] as const;

export default async function TasksPage() {
  const [today, tasks] = await Promise.all([
    getTodayForUser(),
    listPendingTasks(),
  ]);

  const groups = groupTasks(tasks, today);
  const isEmpty = tasks.length === 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Tareas</h1>

      {isEmpty ? (
        <p className="text-sm text-neutral-500">
          No tienes tareas pendientes. Usa el botón + para crear la primera.
        </p>
      ) : (
        SECTIONS.map(({ key, label }) => {
          const group: Task[] = groups[key];
          if (group.length === 0) return null;

          return (
            <section key={key} className="flex flex-col gap-2">
              <h2 className="text-sm font-medium text-neutral-500">
                {label} ({group.length})
              </h2>
              <ul className="flex flex-col">
                {group.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

import { notFound } from 'next/navigation';
import { listProjects } from '@/features/projects';
import { listTasksForProject, TaskItem } from '@/features/tasks';

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [projects, tasks] = await Promise.all([
    listProjects(),
    listTasksForProject(id),
  ]);

  // RLS hace que un id ajeno simplemente no aparezca en listProjects.
  const project = projects.find((candidate) => candidate.id === id);
  if (!project) notFound();

  const done = tasks.filter((task) => task.completedAt !== null).length;
  const percent = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="size-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="text-xl font-semibold">{project.name}</h1>
        </div>
        <p className="text-sm text-neutral-500">
          {done} de {tasks.length} completadas ({percent}%)
        </p>
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200"
        >
          <div
            className="h-full bg-neutral-900 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </header>

      {tasks.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Este proyecto todavía no tiene tareas.
        </p>
      ) : (
        <ul className="flex flex-col">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}

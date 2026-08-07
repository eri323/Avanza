import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, ChevronLeftIcon, ProgressBar } from '@/components/ui';
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
    <div className="flex flex-col gap-6">
      <Link
        href="/proyectos"
        className="flex items-center gap-1 text-label text-text-soft transition-colors hover:underline"
      >
        <ChevronLeftIcon className="size-5" />
        Proyectos
      </Link>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="size-3.5 shrink-0 rounded-xl"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="min-w-0 flex-1 truncate text-title text-text">
            {project.name}
          </h1>
          <span className="text-title text-accent">{percent}%</span>
        </div>
        <ProgressBar
          percent={percent}
          label={`Avance de ${project.name}`}
          tone="accent"
        />
        <p className="text-caption text-text-muted">
          {done} de {tasks.length} completadas
        </p>
      </Card>

      {tasks.length === 0 ? (
        <p className="text-body text-text-muted">
          Este proyecto todavía no tiene tareas.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} href={`/tareas/${task.id}`} />
          ))}
        </ul>
      )}
    </div>
  );
}

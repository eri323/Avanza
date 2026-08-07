import { notFound } from 'next/navigation';
import { listProjects } from '@/features/projects';
import { getTaskById, TaskDetail } from '@/features/tasks';

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [task, projects] = await Promise.all([getTaskById(id), listProjects()]);

  // RLS hace que una tarea ajena se vea igual que una borrada, y las dos
  // merecen la misma respuesta.
  if (!task) notFound();

  const project = projects.find((candidate) => candidate.id === task.projectId);

  return (
    <TaskDetail
      task={task}
      projectName={project?.name ?? null}
      projectColor={project?.color ?? null}
    />
  );
}

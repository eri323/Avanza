import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui';
import { listProjectsWithCounts } from '@/features/projects';
import { NewProjectForm } from './new-project-form';

export default async function ProjectsPage() {
  const projects = await listProjectsWithCounts();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/perfil"
        className="flex items-center gap-1 text-label text-text-soft transition-colors hover:underline lg:hidden"
      >
        <ChevronLeftIcon className="size-5" />
        Perfil
      </Link>

      <h1 className="text-display text-text">Proyectos</h1>

      <NewProjectForm />

      {projects.length === 0 ? (
        <p className="text-body text-text-muted">
          Aún no tienes proyectos. Crea el primero arriba.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/proyectos/${project.id}`}
                className="flex items-center gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3.5 transition-colors hover:border-accent/90"
              >
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-xl"
                  style={{ backgroundColor: project.color }}
                />
                <span className="min-w-0 flex-1 truncate text-body text-text">
                  {project.name}
                </span>
                <span className="shrink-0 text-caption text-text-muted">
                  {project.pendingCount} pendientes
                </span>
                <ChevronRightIcon className="size-5 shrink-0 text-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

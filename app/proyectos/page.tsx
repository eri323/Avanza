import Link from 'next/link';
import { listProjects } from '@/features/projects';
import { NewProjectForm } from './new-project-form';

export default async function ProjectsPage() {
  const projects = await listProjects();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">Proyectos</h1>

      <NewProjectForm />

      {projects.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Aún no tienes proyectos. Crea el primero arriba.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/proyectos/${project.id}`}
                className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-neutral-100"
              >
                <span
                  aria-hidden
                  className="size-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

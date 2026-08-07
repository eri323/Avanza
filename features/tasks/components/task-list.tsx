'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Chip } from '@/components/ui';
import type { IsoDate } from '@/lib/dates';
import type { ProjectWithCount } from '@/features/projects';
import { groupTasks } from '../grouping';
import type { Task } from '../types';
import { TaskItem } from './task-item';

const SECTIONS = [
  { key: 'overdue', label: 'Vencidas' },
  { key: 'today', label: 'Hoy' },
  { key: 'upcoming', label: 'Próximas' },
  { key: 'someday', label: 'Sin fecha' },
] as const;

export function TaskList({
  tasks,
  projects,
  today,
}: {
  tasks: Task[];
  projects: ProjectWithCount[];
  today: IsoDate;
}) {
  const selected = useSearchParams().get('proyecto');

  const visible =
    selected === null
      ? tasks
      : tasks.filter((task) => task.projectId === selected);

  const groups = groupTasks(visible, today);

  return (
    <div className="flex flex-col gap-6">
      {projects.length > 0 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {/* El <Link> envuelve al chip en vez de meterse dentro: así el área
              pulsable es la píldora entera y `Chip` no necesita saber de rutas. */}
          <Link href="/tareas" className="shrink-0">
            <Chip as="span" selected={selected === null}>
              Todas
            </Chip>
          </Link>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/tareas?proyecto=${project.id}`}
              className="shrink-0"
            >
              <Chip as="span" dot={project.color} selected={selected === project.id}>
                {project.name}
                <span className="text-caption opacity-70">
                  {project.pendingCount}
                </span>
              </Chip>
            </Link>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-body text-text-muted">
          {selected === null
            ? 'No tienes tareas pendientes. Usa el botón + para crear la primera.'
            : 'Este proyecto no tiene tareas pendientes.'}
        </p>
      ) : (
        SECTIONS.map(({ key, label }) => {
          const group = groups[key];
          if (group.length === 0) return null;

          return (
            <section key={key} className="flex flex-col gap-3">
              <h2
                className={`text-caption uppercase ${
                  key === 'overdue' ? 'text-text' : 'text-text-muted'
                }`}
              >
                {label} ({group.length})
              </h2>
              {/* El enlace va dentro de la fila, en el título: envolver la fila
                  entera pondría un <a> alrededor de la casilla y marcar
                  navegaría. */}
              <ul className="flex flex-col gap-2">
                {group.map((task) => (
                  <TaskItem key={task.id} task={task} href={`/tareas/${task.id}`} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

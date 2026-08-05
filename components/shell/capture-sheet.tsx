'use client';

import { useState, useTransition } from 'react';
import { Chip, Sheet } from '@/components/ui';
import { addDays, type IsoDate } from '@/lib/dates';
import type { ProjectWithCount } from '@/features/projects';
import { createTask } from '@/features/tasks/actions';
import type { TaskPriority } from '@/features/tasks';
import type { CaptureTab } from './capture-provider';

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'none', label: 'Sin prioridad' },
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

export function CaptureSheet({
  projects,
  today,
  tab,
  onTabChange,
  onClose,
}: {
  projects: ProjectWithCount[];
  today: IsoDate;
  tab: CaptureTab | null;
  onTabChange: (tab: CaptureTab) => void;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('none');
  const [dueDate, setDueDate] = useState<IsoDate | null>(today);
  const [projectId, setProjectId] = useState<string | null>(null);

  const tomorrow = addDays(today, 1);

  function resetTask() {
    setTitle('');
    setPriority('none');
    setDueDate(today);
    setProjectId(null);
  }

  function submitTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set('title', title);
    formData.set('priority', priority);
    if (dueDate) formData.set('dueDate', dueDate);
    if (projectId) formData.set('projectId', projectId);

    startTransition(async () => {
      const result = await createTask(formData);
      if (result.ok) {
        resetTask();
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Sheet open={tab !== null} onClose={onClose} title="Añadir">
      <div
        role="tablist"
        aria-label="Qué añadir"
        className="mb-5 flex gap-2 rounded-md bg-surface-sunken p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'task'}
          onClick={() => onTabChange('task')}
          className={`flex-1 rounded-xs py-2 text-label transition-colors ${
            tab === 'task'
              ? 'bg-surface-elevated text-text shadow-soft'
              : 'text-text-soft'
          }`}
        >
          Tarea
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'habit'}
          onClick={() => onTabChange('habit')}
          className={`flex-1 rounded-xs py-2 text-label transition-colors ${
            tab === 'habit'
              ? 'bg-surface-elevated text-text shadow-soft'
              : 'text-text-soft'
          }`}
        >
          Hábito
        </button>
      </div>

      {tab === 'task' && (
        <form onSubmit={submitTask} className="flex flex-col gap-5">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            data-autofocus
            placeholder="¿Qué hay que hacer?"
            aria-label="Título de la tarea"
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-body text-text outline-none placeholder:text-text-muted focus:border-accent"
          />

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-caption uppercase text-text-muted">
              Prioridad
            </legend>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((option) => (
                <Chip
                  key={option.value}
                  as="button"
                  type="button"
                  selected={priority === option.value}
                  onClick={() => setPriority(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-caption uppercase text-text-muted">
              Fecha
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              <Chip as="button" type="button" selected={dueDate === today} onClick={() => setDueDate(today)}>
                Hoy
              </Chip>
              <Chip as="button" type="button" selected={dueDate === tomorrow} onClick={() => setDueDate(tomorrow)}>
                Mañana
              </Chip>
              <Chip as="button" type="button" selected={dueDate === null} onClick={() => setDueDate(null)}>
                Sin fecha
              </Chip>
              <input
                type="date"
                value={dueDate ?? ''}
                onChange={(event) => setDueDate(event.target.value || null)}
                aria-label="Otra fecha"
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-label text-text-soft"
              />
            </div>
          </fieldset>

          {projects.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-caption uppercase text-text-muted">
                Proyecto
              </legend>
              <div className="flex flex-wrap gap-2">
                <Chip as="button" type="button" selected={projectId === null} onClick={() => setProjectId(null)}>
                  Sin proyecto
                </Chip>
                {projects.map((project) => (
                  <Chip
                    key={project.id}
                    as="button"
                    type="button"
                    dot={project.color}
                    selected={projectId === project.id}
                    onClick={() => setProjectId(project.id)}
                  >
                    {project.name}
                  </Chip>
                ))}
              </div>
            </fieldset>
          )}

          {error && <p className="text-label text-accent-warm">{error}</p>}

          <button
            type="submit"
            disabled={pending || title.trim() === ''}
            className="bg-brand-gradient w-full rounded-md py-3.5 text-label text-white shadow-glow transition-opacity disabled:opacity-40"
          >
            {pending ? 'Añadiendo…' : 'Añadir tarea'}
          </button>
        </form>
      )}
    </Sheet>
  );
}

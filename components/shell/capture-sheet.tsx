'use client';

import { useState, useTransition } from 'react';
import { Chip, Sheet } from '@/components/ui';
import { addDays, type IsoDate } from '@/lib/dates';
import type { ProjectWithCount } from '@/features/projects';
import { createTask } from '@/features/tasks/actions';
import type { TaskPriority } from '@/features/tasks';
import { createHabit } from '@/features/habits/actions';
import type { CaptureTab } from './capture-provider';

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'none', label: 'Sin prioridad' },
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

/** Atajo, no restricción: el campo acepta cualquier emoji que el usuario pegue. */
const SUGGESTED_ICONS = ['💧', '📚', '🏃', '🧘', '🌱', '💤', '🎧', '🍎'];

export function CaptureSheet({
  projects,
  today,
  tab,
  error,
  onError,
  onTabChange,
  onClose,
}: {
  projects: ProjectWithCount[];
  today: IsoDate;
  tab: CaptureTab | null;
  error: string | null;
  onError: (error: string | null) => void;
  onTabChange: (tab: CaptureTab) => void;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('none');
  const [dueDate, setDueDate] = useState<IsoDate | null>(today);
  const [projectId, setProjectId] = useState<string | null>(null);

  const [habitName, setHabitName] = useState('');
  const [habitIcon, setHabitIcon] = useState('');
  const [cadence, setCadence] = useState<'daily' | 'weekly'>('daily');
  const [targetPerWeek, setTargetPerWeek] = useState(3);

  const tomorrow = addDays(today, 1);

  function resetTask() {
    setTitle('');
    setPriority('none');
    setDueDate(today);
    setProjectId(null);
  }

  function submitTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError(null);

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
        onError(result.error);
      }
    });
  }

  function resetHabit() {
    setHabitName('');
    setHabitIcon('');
    setCadence('daily');
    setTargetPerWeek(3);
  }

  function submitHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError(null);

    const formData = new FormData();
    formData.set('name', habitName);
    formData.set('icon', habitIcon);
    formData.set('cadence', cadence);
    // Un hábito diario no lleva meta; mandarla rompería el CHECK de la base.
    if (cadence === 'weekly') formData.set('targetPerWeek', String(targetPerWeek));

    startTransition(async () => {
      const result = await createHabit(formData);
      if (result.ok) {
        resetHabit();
        onClose();
      } else {
        onError(result.error);
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
          onClick={() => { onError(null); onTabChange('task'); }}
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
          onClick={() => { onError(null); onTabChange('habit'); }}
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
            // El foco no puede depender sólo del borde: el `--pulso-border`
            // re-derivado (Tarea 33) da ~1.2:1 contra `accent`. El anillo
            // sólido de foco cubre eso con 4.0:1+ contra `surface`.
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-body text-text outline-none placeholder:text-text-muted focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
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

          {error && <p className="text-label text-text">{error}</p>}

          <button
            type="submit"
            disabled={pending || title.trim() === ''}
            className="bg-brand-gradient w-full rounded-md py-3.5 text-label text-white shadow-glow transition-opacity disabled:opacity-40"
          >
            {pending ? 'Añadiendo…' : 'Añadir tarea'}
          </button>
        </form>
      )}

      {tab === 'habit' && (
        <form onSubmit={submitHabit} className="flex flex-col gap-5">
          <div className="flex gap-3">
            <input
              value={habitIcon}
              onChange={(event) => setHabitIcon(event.target.value)}
              maxLength={8}
              placeholder="🙂"
              aria-label="Emoji del hábito"
              className="w-16 shrink-0 rounded-md border border-border bg-surface px-3 py-3 text-center text-body outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
            />
            <input
              value={habitName}
              onChange={(event) => setHabitName(event.target.value)}
              required
              data-autofocus
              placeholder="¿Qué quieres sostener?"
              aria-label="Nombre del hábito"
              className="min-w-0 flex-1 rounded-md border border-border bg-surface px-4 py-3 text-body text-text outline-none placeholder:text-text-muted focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setHabitIcon(emoji)}
                aria-label={`Usar ${emoji}`}
                className={`grid size-11 place-items-center rounded-md border transition-colors ${
                  habitIcon === emoji
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface-elevated hover:border-accent/90'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-caption uppercase text-text-muted">
              Cadencia
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              <Chip as="button" type="button" selected={cadence === 'daily'} onClick={() => setCadence('daily')}>
                Todos los días
              </Chip>
              <Chip as="button" type="button" selected={cadence === 'weekly'} onClick={() => setCadence('weekly')}>
                Veces por semana
              </Chip>
              {cadence === 'weekly' && (
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={targetPerWeek}
                  onChange={(event) => setTargetPerWeek(Number(event.target.value))}
                  aria-label="Veces por semana"
                  className="w-20 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-label text-text"
                />
              )}
            </div>
          </fieldset>

          <p className="text-label text-text-muted">
            El color y la meta detallada se editan desde Hábitos.
          </p>

          {error && <p className="text-label text-text">{error}</p>}

          <button
            type="submit"
            disabled={pending || habitName.trim() === ''}
            className="bg-brand-gradient w-full rounded-md py-3.5 text-label text-white shadow-glow transition-opacity disabled:opacity-40"
          >
            {pending ? 'Creando…' : 'Crear hábito'}
          </button>
        </form>
      )}
    </Sheet>
  );
}

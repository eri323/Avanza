'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOptimistic, useState, useTransition } from 'react';
import {
  CalendarIcon,
  Card,
  CheckBox,
  ChevronLeftIcon,
  Chip,
  FlagIcon,
  IconButton,
  TrashIcon,
} from '@/components/ui';
import { formatDayMonth } from '@/lib/dates';
import { deleteTask, setTaskCompleted } from '../actions';
import type { Task, TaskPriority } from '../types';

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  none: 'Sin prioridad',
  low: 'Prioridad baja',
  medium: 'Prioridad media',
  high: 'Prioridad alta',
};

export function TaskDetail({
  task,
  projectName,
  projectColor,
}: {
  task: Task;
  projectName: string | null;
  projectColor: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticDone, setOptimisticDone] = useOptimistic(
    task.completedAt !== null,
  );

  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      const result = await setTaskCompleted(task.id, !optimisticDone);
      if (!result.ok) setError(result.error);
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result.ok) {
        // Volver a la lista: el panel se queda sin contenido que enseñar.
        router.push('/tareas');
      } else {
        setError(result.error);
      }
    });
  }

  return (
    // `data-detalle` es lo que la regla de CSS busca para ocultar la lista en
    // móvil. No es decorativo: si desaparece, el maestro-detalle deja de serlo.
    <div data-detalle className="lg:sticky lg:top-6">
      <Card className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/tareas"
            className="flex items-center gap-1 text-label text-text-soft transition-colors hover:underline lg:hidden"
          >
            <ChevronLeftIcon className="size-5" />
            Tareas
          </Link>
          <IconButton
            label="Eliminar tarea"
            tone="danger"
            disabled={pending}
            onClick={remove}
            className="ml-auto"
          >
            <TrashIcon className="size-5" />
          </IconButton>
        </div>

        <div className="flex items-start gap-3">
          <CheckBox
            checked={optimisticDone}
            onToggle={toggle}
            disabled={pending}
            label={`Completar ${task.title}`}
          />
          <h1
            className={`text-title ${
              optimisticDone ? 'text-text-muted line-through' : 'text-text'
            }`}
          >
            {task.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip>
            <FlagIcon className="size-4" />
            {PRIORITY_LABEL[task.priority]}
          </Chip>
          <Chip>
            <CalendarIcon className="size-4" />
            {task.dueDate ? formatDayMonth(task.dueDate) : 'Sin fecha'}
          </Chip>
          {projectName && (
            <Chip dot={projectColor ?? undefined}>{projectName}</Chip>
          )}
        </div>

        {task.notes && (
          <p className="whitespace-pre-wrap text-body text-text-soft">
            {task.notes}
          </p>
        )}

        {error && <p className="text-label text-text">{error}</p>}
      </Card>
    </div>
  );
}

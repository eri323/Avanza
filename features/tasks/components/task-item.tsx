'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { CheckBox } from '@/components/ui';
import { formatDayMonth } from '@/lib/dates';
import { setTaskCompleted } from '../actions';
import type { Task } from '../types';

/**
 * Actualización optimista: marcar es la interacción más frecuente de la app y
 * esperar la respuesta del servidor la haría sentir lenta. Si la escritura
 * falla, React revierte el estado optimista al terminar la transición.
 */
export function TaskItem({ task, href }: { task: Task; href?: string }) {
  const [pending, startTransition] = useTransition();
  const [optimisticDone, setOptimisticDone] = useOptimistic(
    task.completedAt !== null,
  );
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      const result = await setTaskCompleted(task.id, !optimisticDone);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li className="flex flex-col gap-1 rounded-md border border-border bg-surface-elevated px-4 py-3">
      <div className="flex items-center gap-3">
        <CheckBox
          checked={optimisticDone}
          onToggle={toggle}
          disabled={pending}
          label={`Completar ${task.title}`}
        />
        {href ? (
          <Link
            href={href}
            className={`min-w-0 flex-1 truncate text-body hover:underline ${
              optimisticDone ? 'text-text-muted line-through' : 'text-text'
            }`}
          >
            {task.title}
          </Link>
        ) : (
          <span
            className={`min-w-0 flex-1 truncate text-body ${
              optimisticDone ? 'text-text-muted line-through' : 'text-text'
            }`}
          >
            {task.title}
          </span>
        )}
        {task.dueDate && (
          <span className="shrink-0 text-caption text-text-muted">
            {formatDayMonth(task.dueDate)}
          </span>
        )}
      </div>
      {error && <p className="text-label text-accent-warm">{error}</p>}
    </li>
  );
}

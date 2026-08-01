'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { setTaskCompleted } from '../actions';
import type { Task } from '../types';

/**
 * Actualización optimista: marcar es la interacción más frecuente de la app y
 * esperar la respuesta del servidor la haría sentir lenta. Si la escritura
 * falla, React revierte el estado optimista al terminar la transición.
 */
export function TaskItem({ task }: { task: Task }) {
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
    <li className="flex flex-col gap-1 rounded-md px-2 py-1.5 hover:bg-neutral-50">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={optimisticDone}
          onChange={toggle}
          disabled={pending}
          aria-label={`Completar ${task.title}`}
          className="size-4"
        />
        <span className={optimisticDone ? 'text-neutral-400 line-through' : ''}>
          {task.title}
        </span>
        {task.dueDate && (
          <span className="ml-auto text-xs text-neutral-500">{task.dueDate}</span>
        )}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </li>
  );
}

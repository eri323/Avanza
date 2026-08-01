'use client';

import { useOptimistic, useTransition } from 'react';
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

  function toggle() {
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      await setTaskCompleted(task.id, !optimisticDone);
    });
  }

  return (
    <li className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-neutral-50">
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
    </li>
  );
}

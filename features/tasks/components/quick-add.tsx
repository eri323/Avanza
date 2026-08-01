'use client';

import { useRef, useState, useTransition } from 'react';
import { createTask } from '../actions';
import type { Project } from '@/features/projects/queries';

export function QuickAdd({ projects }: { projects: Project[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createTask(formData);
      if (result.ok) {
        formRef.current?.reset();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <form ref={formRef} action={handleSubmit} className="flex flex-wrap gap-2">
        <input
          name="title"
          required
          placeholder="¿Qué hay que hacer?"
          className="min-w-48 flex-1 rounded-md border border-neutral-300 px-3 py-2"
        />
        <input
          name="dueDate"
          type="date"
          aria-label="Fecha límite"
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
        <select
          name="projectId"
          aria-label="Proyecto"
          className="rounded-md border border-neutral-300 px-3 py-2"
        >
          <option value="">Sin proyecto</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
        >
          Añadir
        </button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

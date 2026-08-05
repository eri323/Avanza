'use client';

import { useRef, useState, useTransition } from 'react';
import { createProject } from '@/features/projects/actions';

export function NewProjectForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProject(formData);
      if (result.ok) {
        formRef.current?.reset();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <form ref={formRef} action={handleSubmit} className="flex gap-2">
        <input
          name="name"
          required
          placeholder="Nuevo proyecto"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2"
        />
        <input
          name="color"
          type="color"
          defaultValue="#6366F1"
          aria-label="Color del proyecto"
          className="h-10 w-12 rounded-md border border-neutral-300"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
        >
          Crear
        </button>
      </form>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}

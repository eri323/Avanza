'use client';

import { useRef, useState, useTransition } from 'react';
import { PlusIcon } from '@/components/ui';
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
          // El foco no puede depender sólo del borde: el `--pulso-border`
          // re-derivado (Tarea 33) da ~1.2:1 contra `accent`. El anillo
          // sólido de foco cubre eso con 4.0:1+ contra `surface-elevated`.
          className="min-w-0 flex-1 rounded-md border border-border bg-surface-elevated px-4 py-3 text-body text-text outline-none placeholder:text-text-muted focus:border-accent focus-visible:ring-2 focus-visible:ring-accent"
        />
        <input
          name="color"
          type="color"
          defaultValue="#6366F1"
          aria-label="Color del proyecto"
          className="h-12 w-14 shrink-0 rounded-md border border-border bg-transparent"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Crear proyecto"
          className="bg-brand-gradient grid size-12 shrink-0 place-items-center rounded-md text-white shadow-glow disabled:opacity-40"
        >
          <PlusIcon className="size-6" />
        </button>
      </form>
      {error && <p className="text-label text-text">{error}</p>}
    </div>
  );
}

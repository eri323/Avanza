'use client';

import { useRef, useState, useTransition } from 'react';
import { createHabit } from '../actions';

export function NewHabitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [cadence, setCadence] = useState<'daily' | 'weekly'>('daily');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createHabit(formData);
      if (result.ok) {
        formRef.current?.reset();
        setCadence('daily');
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <form ref={formRef} action={handleSubmit} className="flex flex-wrap gap-2">
        <input
          name="name"
          required
          placeholder="Nuevo hábito"
          className="min-w-48 flex-1 rounded-md border border-neutral-300 px-3 py-2"
        />
        <select
          name="cadence"
          value={cadence}
          onChange={(event) => setCadence(event.target.value as 'daily' | 'weekly')}
          aria-label="Cadencia"
          className="rounded-md border border-neutral-300 px-3 py-2"
        >
          <option value="daily">Todos los días</option>
          <option value="weekly">Veces por semana</option>
        </select>
        {cadence === 'weekly' && (
          <input
            name="targetPerWeek"
            type="number"
            min={1}
            max={7}
            defaultValue={3}
            required
            aria-label="Veces por semana"
            className="w-20 rounded-md border border-neutral-300 px-3 py-2"
          />
        )}
        <input
          name="color"
          type="color"
          defaultValue="#22C55E"
          aria-label="Color del hábito"
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

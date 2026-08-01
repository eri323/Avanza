'use client';

import { useState, useTransition } from 'react';
import { updateTimezone } from '@/features/profile/actions';

const TIMEZONES = [
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/Madrid',
  'UTC',
];

export function TimezoneForm({ current }: { current: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateTimezone(formData);
      setStatus(result.ok ? 'Guardado.' : result.error);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="timezone" className="text-sm font-medium">
        Zona horaria
      </label>
      <p className="text-xs text-neutral-500">
        Define qué día es &ldquo;hoy&rdquo; para tus tareas y hábitos.
      </p>
      <select
        id="timezone"
        name="timezone"
        defaultValue={current}
        className="rounded-md border border-neutral-300 px-3 py-2"
      >
        {TIMEZONES.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
      {status && <p className="text-sm text-neutral-600">{status}</p>}
    </form>
  );
}

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
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-md border border-border bg-surface-elevated p-4"
    >
      <label htmlFor="timezone" className="text-label text-text">
        Zona horaria
      </label>
      <p className="text-caption text-text-muted">
        Define qué día es &ldquo;hoy&rdquo; para tus tareas y hábitos.
      </p>
      <select
        id="timezone"
        name="timezone"
        defaultValue={current}
        className="rounded-xs border border-border bg-surface px-3 py-2.5 text-body text-text"
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
        className="self-start rounded-xs border border-border px-4 py-2 text-label text-text-soft transition-colors hover:border-accent/90 disabled:opacity-40"
      >
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
      {status && <p className="text-label text-text-soft">{status}</p>}
    </form>
  );
}

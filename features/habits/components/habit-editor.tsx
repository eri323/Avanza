'use client';

import { useState, useTransition } from 'react';
import { Chip, Sheet } from '@/components/ui';
import { updateHabit } from '../actions';
import type { Habit } from '../types';

export function HabitEditor({
  habit,
  open,
  onClose,
}: {
  habit: Habit;
  open: boolean;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState(habit.icon ?? '');
  const [color, setColor] = useState(habit.color);
  const [cadence, setCadence] = useState(habit.cadence);
  const [targetPerWeek, setTargetPerWeek] = useState(habit.targetPerWeek ?? 3);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set('id', habit.id);
    formData.set('name', name);
    formData.set('icon', icon);
    formData.set('color', color);
    formData.set('cadence', cadence);
    if (cadence === 'weekly') formData.set('targetPerWeek', String(targetPerWeek));

    startTransition(async () => {
      const result = await updateHabit(formData);
      if (result.ok) {
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title="Editar hábito">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex gap-3">
          <input
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            maxLength={8}
            placeholder="🙂"
            aria-label="Emoji del hábito"
            className="w-16 shrink-0 rounded-md border border-border bg-surface px-3 py-3 text-center text-body outline-none focus:border-accent"
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            data-autofocus
            aria-label="Nombre del hábito"
            className="min-w-0 flex-1 rounded-md border border-border bg-surface px-4 py-3 text-body text-text outline-none focus:border-accent"
          />
        </div>

        <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-elevated px-4 py-3">
          <span className="text-label text-text">Color</span>
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            aria-label="Color del hábito"
            className="h-9 w-14 rounded-xs border border-border bg-transparent"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-caption uppercase text-text-muted">
            Cadencia
          </legend>
          <div className="flex flex-wrap items-center gap-2">
            <Chip as="button" type="button" selected={cadence === 'daily'} onClick={() => setCadence('daily')}>
              Todos los días
            </Chip>
            <Chip as="button" type="button" selected={cadence === 'weekly'} onClick={() => setCadence('weekly')}>
              Veces por semana
            </Chip>
            {cadence === 'weekly' && (
              <input
                type="number"
                min={1}
                max={7}
                value={targetPerWeek}
                onChange={(event) => setTargetPerWeek(Number(event.target.value))}
                aria-label="Veces por semana"
                className="w-20 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-label text-text"
              />
            )}
          </div>
        </fieldset>

        {error && <p className="text-label text-text">{error}</p>}

        <button
          type="submit"
          disabled={pending || name.trim() === ''}
          className="bg-brand-gradient w-full rounded-md py-3.5 text-label text-white shadow-glow transition-opacity disabled:opacity-40"
        >
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </Sheet>
  );
}

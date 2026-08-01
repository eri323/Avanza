'use client';

import { useOptimistic, useState, useTransition } from 'react';
import type { IsoDate } from '@/lib/dates';
import { toggleHabitEntry } from '../actions';
import type { HabitWithProgress } from '../types';
import { HabitHeatmap } from './habit-heatmap';

export function HabitCard({
  habit,
  today,
}: {
  habit: HabitWithProgress;
  today: IsoDate;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticDone, setOptimisticDone] = useOptimistic(habit.doneToday);

  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      const result = await toggleHabitEntry(habit.id, today);
      if (!result.ok) setError(result.error);
    });
  }

  const cadenceLabel =
    habit.cadence === 'daily'
      ? 'Todos los días'
      : `${habit.targetPerWeek} veces por semana`;

  const streakLabel =
    habit.streak === 0
      ? 'Sin racha'
      : habit.cadence === 'daily'
        ? `${habit.streak} ${habit.streak === 1 ? 'día seguido' : 'días seguidos'}`
        : `${habit.streak} ${habit.streak === 1 ? 'semana seguida' : 'semanas seguidas'}`;

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-pressed={optimisticDone}
          aria-label={`Marcar ${habit.name} hoy`}
          className="mt-0.5 size-5 shrink-0 rounded-full border-2 transition-colors disabled:opacity-50"
          style={{
            borderColor: habit.color,
            backgroundColor: optimisticDone ? habit.color : 'transparent',
          }}
        />
        <div className="flex flex-col">
          <h3 className="font-medium">{habit.name}</h3>
          <p className="text-xs text-neutral-500">
            {cadenceLabel} · {streakLabel}
          </p>
        </div>
      </div>

      <HabitHeatmap
        entryDates={habit.entryDates}
        today={today}
        color={habit.color}
      />

      {error && <p className="text-sm text-red-700">{error}</p>}
    </article>
  );
}

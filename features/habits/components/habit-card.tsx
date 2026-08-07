'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { Card, CheckBox, ChevronRightIcon } from '@/components/ui';
import type { IsoDate } from '@/lib/dates';
import { toggleHabitEntry } from '../actions';
import { weekDots } from '../heatmap';
import type { HabitWithProgress } from '../types';

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

  // El punto de hoy refleja la marca optimista; los demás vienen del servidor.
  const dots = weekDots(habit.entryDates, today).map((dot) =>
    dot.isToday ? { ...dot, done: optimisticDone } : dot,
  );

  return (
    <Card as="article" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <CheckBox
          checked={optimisticDone}
          onToggle={toggle}
          disabled={pending}
          color={habit.color}
          shape="circle"
          label={`Marcar ${habit.name} hoy`}
        />
        <span aria-hidden className="text-heading leading-none">
          {habit.icon ?? '•'}
        </span>
        <Link
          href={`/habitos/${habit.id}`}
          className="flex min-w-0 flex-1 items-center gap-2 transition-colors hover:underline"
        >
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-heading text-text">{habit.name}</span>
            <span className="text-caption text-text-muted">
              {cadenceLabel} · {streakLabel}
            </span>
          </span>
          <ChevronRightIcon className="ml-auto size-5 shrink-0 text-text-muted" />
        </Link>
      </div>

      <div className="flex justify-between gap-1" role="group" aria-label="Esta semana">
        {dots.map((dot) => (
          <span key={dot.date} className="flex flex-col items-center gap-1.5">
            <span
              title={`${dot.date}: ${dot.done ? 'cumplido' : 'sin marcar'}`}
              className={`size-7 rounded-xl border-2 bg-surface-sunken ${
                dot.isToday ? 'border-current text-accent' : 'border-transparent'
              }`}
              style={{
                backgroundColor: dot.done ? habit.color : undefined,
                opacity: dot.isFuture ? 0.3 : 1,
              }}
            />
            <span className="text-caption text-text-muted">{dot.letter}</span>
          </span>
        ))}
      </div>

      {error && <p className="text-label text-text">{error}</p>}
    </Card>
  );
}

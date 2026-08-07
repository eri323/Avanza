'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import {
  Card,
  ChevronLeftIcon,
  HabitsIcon,
  HeatGrid,
  StatTile,
  type HeatColumn,
} from '@/components/ui';
import type { IsoDate } from '@/lib/dates';
import { toggleHabitEntry } from '../actions';
import type { HabitWithProgress } from '../types';

export function HabitDetail({
  habit,
  today,
  best,
  monthPercent,
  columns,
}: {
  habit: HabitWithProgress;
  today: IsoDate;
  best: number;
  monthPercent: number;
  columns: HeatColumn[];
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

  const unit = habit.cadence === 'daily' ? 'días' : 'semanas';

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/habitos"
        className="flex items-center gap-1 text-label text-text-soft transition-colors hover:underline"
      >
        <ChevronLeftIcon className="size-5" />
        Hábitos
      </Link>

      <header className="flex items-center gap-3">
        <span aria-hidden className="text-display leading-none">
          {habit.icon ?? '•'}
        </span>
        <div className="flex flex-col">
          <h1 className="text-title text-text">{habit.name}</h1>
          <p className="text-label text-text-muted">
            {habit.cadence === 'daily'
              ? 'Todos los días'
              : `${habit.targetPerWeek} veces por semana`}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          tone="feature"
          value={String(habit.streak)}
          label={`Racha (${unit})`}
          icon={<HabitsIcon className="size-5" />}
        />
        <StatTile value={`${monthPercent}%`} label="Este mes" />
        <StatTile value={String(best)} label={`Mejor (${unit})`} />
      </div>

      <Card className="flex flex-col gap-3">
        <h2 className="text-caption uppercase text-text-muted">
          Últimas cinco semanas
        </h2>
        <HeatGrid
          columns={columns}
          color={habit.color}
          caption="Últimas cinco semanas"
        />
      </Card>

      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={optimisticDone}
        className={`w-full rounded-md py-3.5 text-label transition-opacity disabled:opacity-40 ${
          optimisticDone
            ? 'border border-border bg-surface-elevated text-text-soft'
            : 'bg-brand-gradient text-white shadow-glow'
        }`}
      >
        {optimisticDone ? 'Marcado hoy · deshacer' : 'Marcar hoy'}
      </button>

      {error && <p className="text-label text-text">{error}</p>}
    </div>
  );
}

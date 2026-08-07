'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { Card, ProgressBar } from '@/components/ui';
import type { IsoDate } from '@/lib/dates';
import { pickNotice } from '@/lib/notice';
import { dayXp } from '@/lib/xp';
import { toggleHabitEntry } from '@/features/habits/actions';
import { setTaskCompleted } from '@/features/tasks/actions';
import type { TaskPriority } from '@/features/tasks';
import { HabitChip } from './habit-chip';
import { NoticeCard } from './notice-card';
import { TaskRow } from './task-row';

export type BoardTask = {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: IsoDate | null;
  done: boolean;
};

export type BoardHabit = {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  cadence: 'daily' | 'weekly';
  streak: number;
  done: boolean;
};

type BoardState = { tasks: BoardTask[]; habits: BoardHabit[] };

type Toggle =
  | { kind: 'task'; id: string; done: boolean }
  | { kind: 'habit'; id: string; done: boolean };

/**
 * Un único reductor para tareas y hábitos.
 *
 * El XP, la barra y el aviso se derivan de este estado, así que si la escritura
 * falla y React descarta el valor optimista, los tres vuelven atrás a la vez.
 * Con un `useOptimistic` por casilla, revertir dejaría la tarea sin marcar y
 * los puntos sumados.
 */
function reduce(state: BoardState, toggle: Toggle): BoardState {
  if (toggle.kind === 'task') {
    return {
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === toggle.id ? { ...task, done: toggle.done } : task,
      ),
    };
  }

  return {
    ...state,
    habits: state.habits.map((habit) =>
      habit.id === toggle.id
        ? {
            ...habit,
            done: toggle.done,
            // La racha se mueve con la marca para que el aviso de "racha en
            // riesgo" desaparezca en el mismo render en que se marca.
            streak: toggle.done ? habit.streak + 1 : Math.max(0, habit.streak - 1),
          }
        : habit,
    ),
  };
}

export function TodayBoard({
  today,
  tasks,
  habits,
}: {
  today: IsoDate;
  tasks: BoardTask[];
  habits: BoardHabit[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, applyToggle] = useOptimistic<BoardState, Toggle>(
    { tasks, habits },
    reduce,
  );

  const xp = dayXp(
    state.tasks.map((task) => ({ priority: task.priority, done: task.done })),
    state.habits.map((habit) => ({ done: habit.done })),
  );

  const overdue = state.tasks.filter(
    (task) => !task.done && task.dueDate !== null && task.dueDate < today,
  );
  const dueToday = state.tasks.filter(
    (task) => !task.done && task.dueDate === today,
  );
  const doneToday = state.tasks.filter((task) => task.done);

  const notice = pickNotice(
    state.habits.map((habit) => ({
      name: habit.name,
      cadence: habit.cadence,
      streak: habit.streak,
      doneToday: habit.done,
    })),
    overdue.map((task) => ({ dueDate: task.dueDate! })),
  );

  function toggleTask(task: BoardTask) {
    setError(null);
    startTransition(async () => {
      applyToggle({ kind: 'task', id: task.id, done: !task.done });
      const result = await setTaskCompleted(task.id, !task.done);
      if (!result.ok) setError(result.error);
    });
  }

  function toggleHabit(habit: BoardHabit) {
    setError(null);
    startTransition(async () => {
      applyToggle({ kind: 'habit', id: habit.id, done: !habit.done });
      const result = await toggleHabitEntry(habit.id, today);
      if (!result.ok) setError(result.error);
    });
  }

  const nothingToDo =
    state.tasks.length === 0 && state.habits.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <NoticeCard notice={notice} />

      <Card tone="feature" className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-caption uppercase text-on-feature-soft">
              Progreso del día
            </span>
            <span className="text-display text-on-feature">
              {xp.earned}
              <span className="text-heading text-on-feature-soft">
                {' '}/ {xp.goal} XP
              </span>
            </span>
          </div>
          <span className="text-title text-positive">{xp.percent}%</span>
        </div>
        <ProgressBar
          percent={xp.percent}
          label="Progreso del día"
          track="on-feature"
        />
      </Card>

      {state.habits.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-caption uppercase text-text-muted">
            Hábitos ({state.habits.filter((habit) => habit.done).length}/
            {state.habits.length})
          </h2>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {state.habits.map((habit) => (
              <HabitChip
                key={habit.id}
                name={habit.name}
                icon={habit.icon}
                color={habit.color}
                done={habit.done}
                streak={habit.streak}
                disabled={pending}
                onToggle={() => toggleHabit(habit)}
              />
            ))}
          </div>
        </section>
      )}

      {overdue.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-caption uppercase text-accent-warm">
            Vencidas ({overdue.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {overdue.map((task) => (
              <TaskRow
                key={task.id}
                {...task}
                overdue
                disabled={pending}
                onToggle={() => toggleTask(task)}
              />
            ))}
          </ul>
        </section>
      )}

      {dueToday.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-caption uppercase text-text-muted">
            Para hoy ({dueToday.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {dueToday.map((task) => (
              <TaskRow
                key={task.id}
                {...task}
                overdue={false}
                disabled={pending}
                onToggle={() => toggleTask(task)}
              />
            ))}
          </ul>
        </section>
      )}

      {doneToday.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-caption uppercase text-text-muted">
            Hechas ({doneToday.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {doneToday.map((task) => (
              <TaskRow
                key={task.id}
                {...task}
                overdue={false}
                disabled={pending}
                onToggle={() => toggleTask(task)}
              />
            ))}
          </ul>
        </section>
      )}

      {nothingToDo && (
        <p className="text-body text-text-muted">
          Nada pendiente para hoy. Usa el botón + para añadir algo.
        </p>
      )}

      {error && <p className="text-label text-accent-warm">{error}</p>}
    </div>
  );
}

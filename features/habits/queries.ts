import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { addDays, type IsoDate } from '@/lib/dates';
import { currentStreak, type Cadence } from '@/lib/streaks';
import type { Habit, HabitWithProgress } from './types';

function toCadence(habit: Habit): Cadence {
  return habit.cadence === 'daily'
    ? { type: 'daily' }
    : { type: 'weekly', targetPerWeek: habit.targetPerWeek! };
}

/**
 * Hábitos activos con su racha ya calculada.
 *
 * Trae las entradas de una sola vez —dos consultas en total, no N+1— y calcula
 * las rachas en memoria con la función pura. `sinceDays` acota la ventana: 84
 * días cubren las 12 semanas del heatmap con margen para la racha visible.
 */
export async function listHabitsWithProgress(
  today: IsoDate,
  sinceDays = 84,
): Promise<HabitWithProgress[]> {
  const supabase = await createClient();

  const { data: habitRows, error: habitsError } = await supabase
    .from('habits')
    .select('id, name, color, cadence, target_per_week')
    .is('archived_at', null)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (habitsError) throw habitsError;
  if (habitRows.length === 0) return [];

  const since = addDays(today, -sinceDays);

  const { data: entryRows, error: entriesError } = await supabase
    .from('habit_entries')
    .select('habit_id, entry_date')
    .gte('entry_date', since)
    .lte('entry_date', today);

  if (entriesError) throw entriesError;

  const entriesByHabit = new Map<string, IsoDate[]>();
  for (const row of entryRows) {
    const list = entriesByHabit.get(row.habit_id) ?? [];
    list.push(row.entry_date);
    entriesByHabit.set(row.habit_id, list);
  }

  return habitRows.map((row) => {
    const habit: Habit = {
      id: row.id,
      name: row.name,
      color: row.color,
      cadence: row.cadence,
      targetPerWeek: row.target_per_week,
    };
    const entryDates = entriesByHabit.get(row.id) ?? [];

    return {
      ...habit,
      entryDates,
      streak: currentStreak(entryDates, toCadence(habit), today),
      doneToday: entryDates.includes(today),
    };
  });
}

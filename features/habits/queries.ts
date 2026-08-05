import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { addDays, type IsoDate } from '@/lib/dates';
import { currentStreak, type Cadence } from '@/lib/streaks';
import { UUID_SHAPE } from '@/lib/validation';
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
    .select('id, name, color, icon, cadence, target_per_week')
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
      icon: row.icon,
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

/**
 * Un hábito con su progreso, con la misma ventana de 84 días que la lista: la
 * pantalla de detalle enseña 12 semanas de heatmap y la mejor racha, y las
 * dos deben medirse contra el mismo histórico que la tarjeta.
 */
export async function getHabitById(
  id: string,
  today: IsoDate,
  sinceDays = 84,
): Promise<HabitWithProgress | null> {
  // Un id sin forma de UUID se rechaza antes de tocar la base: Postgres
  // respondería 22P02 (sintaxis de entrada inválida para uuid), el `throw
  // error` de abajo lo propagaría, y la pantalla de detalle acabaría en un 500
  // en vez de un 404. Un id malformado no puede existir, así que `null` es
  // semánticamente idéntico a "no existe".
  if (!UUID_SHAPE.test(id)) return null;

  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from('habits')
    .select('id, name, color, icon, cadence, target_per_week')
    .eq('id', id)
    .is('archived_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!row) return null;

  const since = addDays(today, -sinceDays);

  const { data: entryRows, error: entriesError } = await supabase
    .from('habit_entries')
    .select('entry_date')
    .eq('habit_id', id)
    .gte('entry_date', since)
    .lte('entry_date', today);

  if (entriesError) throw entriesError;

  const habit: Habit = {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    cadence: row.cadence,
    targetPerWeek: row.target_per_week,
  };

  const entryDates = entryRows.map((entry) => entry.entry_date);

  return {
    ...habit,
    entryDates,
    streak: currentStreak(entryDates, toCadence(habit), today),
    doneToday: entryDates.includes(today),
  };
}

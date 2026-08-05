import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { addDays, todayIn, type IsoDate } from '@/lib/dates';
import {
  levelFromXp,
  lifetimeXp,
  weeklyXp,
  type DayPoint,
  type LevelInfo,
  type XpPriority,
} from '@/lib/xp';

export type LifetimeTotals = {
  completedByPriority: Record<XpPriority, number>;
  habitEntries: number;
};

/**
 * Totales históricos, con `head: true`: Postgres cuenta y no manda ni una fila.
 * Traer el histórico completo para contarlo en memoria funcionaría hoy y se
 * caería el año que viene.
 */
export async function getLifetimeTotals(): Promise<LifetimeTotals> {
  const supabase = await createClient();

  const done = (priority: XpPriority) =>
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('priority', priority)
      .not('completed_at', 'is', null);

  const [entries, none, low, medium, high] = await Promise.all([
    supabase.from('habit_entries').select('id', { count: 'exact', head: true }),
    done('none'),
    done('low'),
    done('medium'),
    done('high'),
  ]);

  for (const result of [entries, none, low, medium, high]) {
    if (result.error) throw result.error;
  }

  return {
    completedByPriority: {
      none: none.count ?? 0,
      low: low.count ?? 0,
      medium: medium.count ?? 0,
      high: high.count ?? 0,
    },
    habitEntries: entries.count ?? 0,
  };
}

export async function getLevel(): Promise<LevelInfo & { totalXp: number }> {
  const totals = await getLifetimeTotals();
  const totalXp = lifetimeXp(totals.completedByPriority, totals.habitEntries);

  return { ...levelFromXp(totalXp), totalXp };
}

/**
 * XP de los últimos siete días.
 *
 * `completed_at` es un instante con zona; el día al que pertenece depende de la
 * zona del perfil, así que se convierte aquí y no en SQL. El margen inferior de
 * 24 h en la consulta cubre de sobra el offset máximo (+14 h), así que ningún
 * completado del borde alto queda fuera por la conversión de zona. A propósito
 * no hay cota superior: `weeklyXp` ya recorta lo que sobra al armar los siete
 * cubos, así que filtrar de más aquí sólo arriesgaría perder un borde.
 */
export async function getWeeklyXp(
  today: IsoDate,
  timezone: string,
): Promise<DayPoint[]> {
  const supabase = await createClient();

  const windowStart = addDays(today, -6);

  const [tasks, entries] = await Promise.all([
    supabase
      .from('tasks')
      .select('priority, completed_at')
      .not('completed_at', 'is', null)
      .gte('completed_at', `${addDays(windowStart, -1)}T00:00:00Z`),
    supabase
      .from('habit_entries')
      .select('entry_date')
      .gte('entry_date', windowStart)
      .lte('entry_date', today),
  ]);

  if (tasks.error) throw tasks.error;
  if (entries.error) throw entries.error;

  const completions = tasks.data.map((row) => ({
    date: todayIn(timezone, new Date(row.completed_at!)),
    priority: row.priority as XpPriority,
  }));

  return weeklyXp(
    completions,
    entries.data.map((row) => row.entry_date),
    today,
  );
}

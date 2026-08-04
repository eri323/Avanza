import { addDays, isoWeekStart, type IsoDate } from './dates';

export type Cadence =
  | { type: 'daily' }
  | { type: 'weekly'; targetPerWeek: number };

/**
 * Racha actual a partir del log de días marcados.
 *
 * La racha nunca se almacena: se deriva de `habit_entries`. Guardarla como
 * columna es la causa habitual de rachas que mienten tras editar una fecha
 * pasada.
 *
 * El periodo en curso goza de gracia: un día (o semana) todavía sin cumplir no
 * rompe la racha, sólo aún no la incrementa. Sin esto la racha de cualquiera
 * caería a cero cada mañana.
 */
export function currentStreak(
  entryDates: IsoDate[],
  cadence: Cadence,
  today: IsoDate,
): number {
  const marked = new Set(entryDates.filter((date) => date <= today));

  if (cadence.type === 'daily') {
    let cursor = marked.has(today) ? today : addDays(today, -1);
    let streak = 0;

    while (marked.has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    return streak;
  }

  const perWeek = new Map<IsoDate, number>();
  for (const date of marked) {
    const week = isoWeekStart(date);
    perWeek.set(week, (perWeek.get(week) ?? 0) + 1);
  }

  const metTarget = (week: IsoDate) =>
    (perWeek.get(week) ?? 0) >= cadence.targetPerWeek;

  const currentWeek = isoWeekStart(today);
  let cursor = metTarget(currentWeek) ? currentWeek : addDays(currentWeek, -7);
  let streak = 0;

  while (metTarget(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -7);
  }

  return streak;
}

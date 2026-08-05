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

/** Semanas ISO con al menos `targetPerWeek` marcas, indexadas por su lunes. */
function weeksMeetingTarget(
  marked: Set<IsoDate>,
  targetPerWeek: number,
): Set<IsoDate> {
  const perWeek = new Map<IsoDate, number>();
  for (const date of marked) {
    const week = isoWeekStart(date);
    perWeek.set(week, (perWeek.get(week) ?? 0) + 1);
  }

  const met = new Set<IsoDate>();
  for (const [week, count] of perWeek) {
    if (count >= targetPerWeek) met.add(week);
  }
  return met;
}

/**
 * La racha más larga que se ha tenido, no la de ahora.
 *
 * Sólo ve la ventana de fechas que se le pasa: quien consulta decide cuánto
 * histórico traer. Con la ventana de 84 días de `listHabitsWithProgress`, la
 * "mejor racha" es la mejor de las últimas doce semanas, y eso es lo que la
 * pantalla debe decir.
 */
export function bestStreak(
  entryDates: IsoDate[],
  cadence: Cadence,
  today: IsoDate,
): number {
  const marked = new Set(entryDates.filter((date) => date <= today));
  if (marked.size === 0) return 0;

  const step = cadence.type === 'daily' ? 1 : 7;
  const universe =
    cadence.type === 'daily'
      ? marked
      : weeksMeetingTarget(marked, cadence.targetPerWeek);

  if (universe.size === 0) return 0;

  let best = 0;
  for (const point of universe) {
    // Sólo se cuenta desde el principio de cada racha: así cada una se recorre
    // una vez y no una por cada uno de sus días.
    if (universe.has(addDays(point, -step))) continue;

    let length = 0;
    let cursor = point;
    while (universe.has(cursor)) {
      length += 1;
      cursor = addDays(cursor, step);
    }
    if (length > best) best = length;
  }

  return best;
}

/**
 * Porcentaje del mes en curso, medido contra lo que se esperaba hasta hoy y no
 * contra el mes entero: a día 3 nadie debería ver un 10%.
 *
 * En cadencia semanal la meta se prorratea por los días transcurridos, sin
 * redondear hacia arriba: si saltara a la meta semanal completa en cuanto
 * empieza una semana nueva, el día 8 del mes (un solo día de la segunda
 * semana) ya exigiría el doble de marcas y el porcentaje caería en vez de
 * mantenerse al día.
 *
 * Ese prorrateo **no** usa semanas ISO, a diferencia de `currentStreak` y
 * `bestStreak`, que en cadencia semanal cuentan semanas ISO completas. Las dos
 * cifras acaban juntas en la pantalla de detalle del hábito y no tienen por qué
 * cuadrar entre sí: miden cosas distintas sobre calendarios distintos.
 */
export function monthlyCompletion(
  entryDates: IsoDate[],
  cadence: Cadence,
  today: IsoDate,
): number {
  const month = today.slice(0, 7);
  const daysElapsed = Number(today.slice(8, 10));

  const marked = new Set(
    entryDates.filter((date) => date <= today && date.startsWith(month)),
  );

  const expected =
    cadence.type === 'daily'
      ? daysElapsed
      : (daysElapsed / 7) * cadence.targetPerWeek;

  if (expected === 0) return 0;

  return Math.min(100, Math.round((marked.size / expected) * 100));
}

/**
 * Racha global: un día cuenta si se marcó cualquier hábito.
 *
 * Es la misma función de siempre aplicada al conjunto; no hay una segunda
 * definición de "racha" que pueda desalinearse con la primera.
 */
export function globalStreak(
  entryDatesByHabit: IsoDate[][],
  today: IsoDate,
): number {
  return currentStreak(entryDatesByHabit.flat(), { type: 'daily' }, today);
}

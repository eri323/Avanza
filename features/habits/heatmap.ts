import { addDays, isoWeekStart, type IsoDate } from '@/lib/dates';
import type { HeatColumn } from '@/components/ui';

/**
 * Traduce el log de días marcados a la forma que pinta `HeatGrid`.
 *
 * La primitiva no sabe qué es un hábito; esta función sí, y por eso vive en
 * `features/`. La dirección de la importación es la que importa: `features` usa
 * `components/ui`, nunca al revés.
 */
export function heatColumns(
  entryDates: IsoDate[],
  today: IsoDate,
  weeks: number,
): HeatColumn[] {
  const marked = new Set(entryDates);
  const firstMonday = addDays(isoWeekStart(today), -7 * (weeks - 1));

  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const date = addDays(firstMonday, week * 7 + day);

      if (date > today) {
        return { key: date, level: 2 as const, label: `${date}: aún no` };
      }
      if (marked.has(date)) {
        return { key: date, level: 1 as const, label: `${date}: cumplido` };
      }
      return { key: date, level: 0 as const, label: `${date}: sin marcar` };
    }),
  );
}

const LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export type WeekDot = {
  date: IsoDate;
  letter: string;
  done: boolean;
  isToday: boolean;
  isFuture: boolean;
};

/** La semana en curso en siete puntos, de lunes a domingo. */
export function weekDots(entryDates: IsoDate[], today: IsoDate): WeekDot[] {
  const marked = new Set(entryDates);
  const monday = isoWeekStart(today);

  return LETTERS.map((letter, index) => {
    const date = addDays(monday, index);

    return {
      date,
      letter,
      done: marked.has(date),
      isToday: date === today,
      isFuture: date > today,
    };
  });
}

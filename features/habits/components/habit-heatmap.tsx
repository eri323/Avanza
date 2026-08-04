import { addDays, isoWeekStart, type IsoDate } from '@/lib/dates';

const WEEKS = 12;

/**
 * Rejilla de 12 semanas × 7 días, construida por columnas desde el lunes de la
 * semana de hace 11 semanas hasta hoy.
 */
export function HabitHeatmap({
  entryDates,
  today,
  color,
}: {
  entryDates: IsoDate[];
  today: IsoDate;
  color: string;
}) {
  const marked = new Set(entryDates);
  const firstMonday = addDays(isoWeekStart(today), -7 * (WEEKS - 1));

  const weeks = Array.from({ length: WEEKS }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(firstMonday, week * 7 + day)),
  );

  return (
    <div className="flex gap-1" role="group" aria-label="Últimas 12 semanas">
      {weeks.map((days, index) => (
        <div key={index} className="flex flex-col gap-1">
          {days.map((date) => {
            const isFuture = date > today;
            const isDone = marked.has(date);
            const status = isFuture ? 'futuro' : isDone ? 'cumplido' : 'no cumplido';

            return (
              <span
                key={date}
                title={`${date}: ${status}`}
                className="size-2.5 rounded-[2px]"
                style={{
                  backgroundColor: isDone ? color : '#E5E5E5',
                  opacity: isFuture ? 0.3 : 1,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

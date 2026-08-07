import { weekdayLetter } from '@/lib/dates';
import type { DayPoint } from '@/lib/xp';

/**
 * Barras proporcionales al mejor día de la semana, no a una escala fija: con
 * escala fija una semana tranquila se vería como un fracaso y una intensa se
 * saldría del marco.
 */
export function WeeklyChart({ week }: { week: DayPoint[] }) {
  const peak = Math.max(...week.map((point) => point.xp), 1);

  return (
    <div className="flex items-end justify-between gap-2" role="group" aria-label="XP de los últimos siete días">
      {week.map((point, index) => {
        const isToday = index === week.length - 1;
        const height = Math.round((point.xp / peak) * 100);

        return (
          <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-caption text-text-muted">{point.xp}</span>
            <div className="flex h-28 w-full items-end">
              <div
                title={`${point.date}: ${point.xp} XP`}
                className={`w-full rounded-xs transition-[height] duration-500 ${
                  isToday ? 'bg-accent' : 'bg-accent/35'
                }`}
                // 4px mínimos: una barra de altura cero no se distingue de un
                // día que no se ha pintado.
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            </div>
            <span
              className={`text-caption ${isToday ? 'font-bold text-text' : 'text-text-muted'}`}
            >
              {weekdayLetter(point.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

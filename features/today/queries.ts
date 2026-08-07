import 'server-only';

import { todayIn, hourIn, type IsoDate } from '@/lib/dates';
import { greetingFor } from '@/lib/greeting';
import type { LevelInfo } from '@/lib/xp';
// Se importa de los módulos concretos y no de los barriles: los barriles de
// `tasks` y `habits` reexportan componentes de cliente, y arrastrarlos a un
// módulo `server-only` mete en el bundle código que esta consulta no usa.
import { getProfile } from '@/features/profile/queries';
import { listDueUpToToday } from '@/features/tasks/queries';
import type { Task } from '@/features/tasks/types';
import { listHabitsWithProgress } from '@/features/habits/queries';
import type { HabitWithProgress } from '@/features/habits/types';
import { getLevel } from '@/features/progress/queries';

export type HomeData = {
  today: IsoDate;
  greeting: string;
  displayName: string | null;
  /**
   * Las pendientes que vencían hoy o antes más todas las de hoy, marcadas o
   * no: es a la vez la lista que se pinta y el pozo del que salen el XP ganado
   * y la meta del día. Separarlo en dos consultas sería la forma de que la
   * barra y la lista se contradijeran.
   *
   * Las completadas con fecha vieja quedan fuera a propósito: ya se contaron el
   * día que les tocaba, y arrastrarlas haría crecer el pozo sin cota. La regla
   * exacta vive en el docblock de `listDueUpToToday`.
   */
  dayTasks: Task[];
  habits: HabitWithProgress[];
  level: LevelInfo & { totalXp: number };
};

export async function getHomeData(): Promise<HomeData> {
  const profile = await getProfile();
  const today = todayIn(profile.timezone);

  const [dayTasks, habits, level] = await Promise.all([
    listDueUpToToday(today),
    listHabitsWithProgress(today),
    getLevel(),
  ]);

  return {
    today,
    greeting: greetingFor(hourIn(profile.timezone)),
    displayName: profile.displayName,
    dayTasks,
    habits,
    level,
  };
}

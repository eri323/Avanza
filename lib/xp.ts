import { addDays, type IsoDate } from './dates';

/**
 * XP derivado, nunca almacenado.
 *
 * Igual que la racha, el XP de este bloque sale de las tareas completadas y de
 * `habit_entries`. El saldo acumulado que no se pierde es estado guardado y
 * pertenece al bloque 4.
 *
 * Este módulo no importa `server-only`: la pantalla de Inicio lo llama también
 * en el cliente, sobre estado optimista, para que revertir una casilla revierta
 * los puntos y la barra en el mismo render.
 */
export type XpPriority = 'none' | 'low' | 'medium' | 'high';

/** Los números salen de la prioridad y no de una columna. */
export const XP_BY_PRIORITY: Record<XpPriority, number> = {
  none: 20,
  low: 40,
  medium: 60,
  high: 100,
};

export const XP_PER_HABIT = 50;

/** `umbral(n) = LEVEL_STEP · (n−1)²`. */
const LEVEL_STEP = 500;

export function xpForTask(priority: XpPriority): number {
  return XP_BY_PRIORITY[priority];
}

export type DayTask = { priority: XpPriority; done: boolean };
export type DayHabit = { done: boolean };
export type DayXp = { earned: number; goal: number; percent: number };

/**
 * XP del día y meta del día.
 *
 * La meta es **todo el XP disponible hoy**. Quien llama ya filtró: las tareas
 * son las de hoy y las vencidas, los hábitos son los que tocan hoy. Aquí sólo
 * se suma, para que la misma función sirva en servidor y en cliente.
 */
export function dayXp(tasks: DayTask[], habits: DayHabit[]): DayXp {
  let earned = 0;
  let goal = 0;

  for (const task of tasks) {
    const value = xpForTask(task.priority);
    goal += value;
    if (task.done) earned += value;
  }

  for (const habit of habits) {
    goal += XP_PER_HABIT;
    if (habit.done) earned += XP_PER_HABIT;
  }

  // Un día sin nada pendiente da meta cero: sin esto la barra dividiría por
  // cero y mostraría NaN justo el día que no había nada que reprochar.
  const percent = goal === 0 ? 0 : Math.round((earned / goal) * 100);

  return { earned, goal, percent };
}

export function lifetimeXp(
  completedByPriority: Record<XpPriority, number>,
  habitEntries: number,
): number {
  const fromTasks = (Object.keys(XP_BY_PRIORITY) as XpPriority[]).reduce(
    (total, priority) =>
      total + completedByPriority[priority] * XP_BY_PRIORITY[priority],
    0,
  );

  return fromTasks + habitEntries * XP_PER_HABIT;
}

export type LevelInfo = {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  percent: number;
};

/**
 * Nivel a partir del XP histórico acumulado.
 *
 * Umbrales cuadráticos: lineal haría que subir de nivel dejara de significar
 * algo al tercer mes; exponencial lo volvería inalcanzable.
 */
export function levelFromXp(totalXp: number): LevelInfo {
  const total = Math.max(0, totalXp);
  const level = Math.floor(Math.sqrt(total / LEVEL_STEP)) + 1;

  const floorXp = LEVEL_STEP * (level - 1) ** 2;
  const xpForNextLevel = LEVEL_STEP * (2 * level - 1);
  const xpIntoLevel = total - floorXp;

  return {
    level,
    xpIntoLevel,
    xpForNextLevel,
    percent: Math.round((xpIntoLevel / xpForNextLevel) * 100),
  };
}

export type DayPoint = { date: IsoDate; xp: number };

/**
 * XP de cada uno de los últimos siete días, del más viejo a hoy.
 *
 * Las fechas de las tareas completadas llegan ya convertidas al día local del
 * usuario: `completed_at` es un instante con zona y quien consulta es el único
 * que conoce la zona del perfil.
 */
export function weeklyXp(
  completions: { date: IsoDate; priority: XpPriority }[],
  habitEntryDates: IsoDate[],
  today: IsoDate,
): DayPoint[] {
  const xpByDate = new Map<IsoDate, number>();

  const add = (date: IsoDate, amount: number) =>
    xpByDate.set(date, (xpByDate.get(date) ?? 0) + amount);

  for (const completion of completions) {
    add(completion.date, xpForTask(completion.priority));
  }
  for (const date of habitEntryDates) {
    add(date, XP_PER_HABIT);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    return { date, xp: xpByDate.get(date) ?? 0 };
  });
}

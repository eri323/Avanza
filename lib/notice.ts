import type { IsoDate } from './dates';

/**
 * Decide el aviso de la tarjeta destacada de Inicio.
 *
 * En el prototipo ese espacio lo ocupa un mensaje de IA inventado. Se conserva
 * el tratamiento visual y se llena con información real y accionable.
 */
export const STREAK_AT_RISK_THRESHOLD = 3;

export type NoticeHabit = {
  name: string;
  cadence: 'daily' | 'weekly';
  streak: number;
  doneToday: boolean;
};

export type NoticeTask = { dueDate: IsoDate };

export type Notice =
  | { kind: 'streak-at-risk'; habitName: string; streak: number }
  | { kind: 'overdue-tasks'; count: number; oldestDueDate: IsoDate }
  | null;

export function pickNotice(
  habits: NoticeHabit[],
  overdue: NoticeTask[],
): Notice {
  // 1. Una racha en riesgo. Sólo las diarias: la racha de un hábito semanal no
  //    se pierde por no marcar hoy, así que avisar de ella sería mentir.
  const atRisk = habits
    .filter(
      (habit) =>
        habit.cadence === 'daily' &&
        !habit.doneToday &&
        habit.streak >= STREAK_AT_RISK_THRESHOLD,
    )
    .sort((a, b) => b.streak - a.streak);

  if (atRisk.length > 0) {
    return {
      kind: 'streak-at-risk',
      habitName: atRisk[0].name,
      streak: atRisk[0].streak,
    };
  }

  // 2. Tareas vencidas arrastradas.
  if (overdue.length > 0) {
    const oldestDueDate = overdue.reduce(
      (oldest, task) => (task.dueDate < oldest ? task.dueDate : oldest),
      overdue[0].dueDate,
    );

    return { kind: 'overdue-tasks', count: overdue.length, oldestDueDate };
  }

  // 3. Si no hay nada que decir, la tarjeta no se pinta.
  return null;
}

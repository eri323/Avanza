import { describe, expect, it } from 'vitest';
import { pickNotice, STREAK_AT_RISK_THRESHOLD } from '@/lib/notice';

const habit = (over: Partial<Parameters<typeof pickNotice>[0][number]> = {}) => ({
  name: 'Leer',
  cadence: 'daily' as const,
  streak: 0,
  doneToday: false,
  ...over,
});

describe('pickNotice', () => {
  it('avisa de la racha en riesgo a partir del umbral', () => {
    expect(STREAK_AT_RISK_THRESHOLD).toBe(3);

    expect(pickNotice([habit({ streak: 3 })], [])).toEqual({
      kind: 'streak-at-risk',
      habitName: 'Leer',
      streak: 3,
    });
  });

  it('no avisa por debajo del umbral', () => {
    expect(pickNotice([habit({ streak: 2 })], [])).toBeNull();
  });

  it('no avisa de un hábito que ya se marcó hoy', () => {
    expect(pickNotice([habit({ streak: 9, doneToday: true })], [])).toBeNull();
  });

  it('ignora los hábitos semanales: su racha no se pierde hoy', () => {
    expect(
      pickNotice([habit({ cadence: 'weekly', streak: 6 })], []),
    ).toBeNull();
  });

  it('elige la racha más larga cuando hay varias en riesgo', () => {
    const notice = pickNotice(
      [habit({ name: 'Leer', streak: 4 }), habit({ name: 'Correr', streak: 11 })],
      [],
    );

    expect(notice).toEqual({
      kind: 'streak-at-risk',
      habitName: 'Correr',
      streak: 11,
    });
  });

  it('la racha en riesgo gana a las tareas vencidas', () => {
    const notice = pickNotice(
      [habit({ streak: 5 })],
      [{ dueDate: '2026-07-01' }, { dueDate: '2026-07-02' }],
    );

    expect(notice?.kind).toBe('streak-at-risk');
  });

  it('sin rachas en riesgo, avisa de las vencidas y de la más vieja', () => {
    expect(
      pickNotice([], [{ dueDate: '2026-07-30' }, { dueDate: '2026-07-02' }]),
    ).toEqual({
      kind: 'overdue-tasks',
      count: 2,
      oldestDueDate: '2026-07-02',
    });
  });

  it('sin nada que decir, no hay aviso y la tarjeta no se pinta', () => {
    expect(pickNotice([], [])).toBeNull();
  });
});

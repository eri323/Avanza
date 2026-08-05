import { describe, expect, it } from 'vitest';
import {
  dayXp,
  levelFromXp,
  lifetimeXp,
  weeklyXp,
  XP_PER_HABIT,
  xpForTask,
} from '@/lib/xp';

describe('xpForTask', () => {
  it('sale de la prioridad y no de una columna', () => {
    expect(xpForTask('none')).toBe(20);
    expect(xpForTask('low')).toBe(40);
    expect(xpForTask('medium')).toBe(60);
    expect(xpForTask('high')).toBe(100);
  });
});

describe('dayXp', () => {
  it('la meta es todo el XP disponible hoy, tareas y hábitos', () => {
    const result = dayXp(
      [
        { priority: 'high', done: true },
        { priority: 'low', done: false },
      ],
      [{ done: true }, { done: false }],
    );

    expect(result.goal).toBe(100 + 40 + XP_PER_HABIT * 2);
    expect(result.earned).toBe(100 + XP_PER_HABIT);
    expect(result.percent).toBe(63);
  });

  it('completarlo todo llena la barra', () => {
    const result = dayXp([{ priority: 'medium', done: true }], [{ done: true }]);

    expect(result.earned).toBe(result.goal);
    expect(result.percent).toBe(100);
  });

  it('un día sin nada pendiente no divide por cero', () => {
    expect(dayXp([], [])).toEqual({ earned: 0, goal: 0, percent: 0 });
  });

  it('cuenta las tareas vencidas dentro de la meta', () => {
    // Quien las llama ya filtró a "vencidas o de hoy": aquí sólo se suman.
    const result = dayXp(
      [
        { priority: 'none', done: false },
        { priority: 'none', done: false },
        { priority: 'none', done: true },
      ],
      [],
    );

    expect(result.goal).toBe(60);
    expect(result.earned).toBe(20);
    expect(result.percent).toBe(33);
  });
});

describe('lifetimeXp', () => {
  it('suma tareas completadas por prioridad más los hábitos marcados', () => {
    const total = lifetimeXp(
      { none: 3, low: 2, medium: 1, high: 4 },
      10,
    );

    expect(total).toBe(3 * 20 + 2 * 40 + 1 * 60 + 4 * 100 + 10 * 50);
  });
});

describe('levelFromXp', () => {
  it('arranca en el nivel 1 con la barra vacía', () => {
    expect(levelFromXp(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 500,
      percent: 0,
    });
  });

  it('sube de nivel justo en el umbral', () => {
    expect(levelFromXp(499).level).toBe(1);
    expect(levelFromXp(500).level).toBe(2);
    expect(levelFromXp(1999).level).toBe(2);
    expect(levelFromXp(2000).level).toBe(3);
    expect(levelFromXp(8000).level).toBe(5);
  });

  it('describe el avance dentro del nivel en curso', () => {
    expect(levelFromXp(1250)).toEqual({
      level: 2,
      xpIntoLevel: 750,
      xpForNextLevel: 1500,
      percent: 50,
    });
  });

  it('no se rompe con un total negativo', () => {
    expect(levelFromXp(-40).level).toBe(1);
  });
});

describe('weeklyXp', () => {
  it('devuelve siete días en orden, del más viejo a hoy', () => {
    const points = weeklyXp([], [], '2026-08-04');

    expect(points).toHaveLength(7);
    expect(points[0].date).toBe('2026-07-29');
    expect(points[6].date).toBe('2026-08-04');
  });

  it('suma tareas y hábitos en el día que les toca', () => {
    const points = weeklyXp(
      [
        { date: '2026-08-04', priority: 'high' },
        { date: '2026-08-04', priority: 'low' },
        { date: '2026-08-01', priority: 'none' },
      ],
      ['2026-08-04', '2026-07-30'],
      '2026-08-04',
    );

    const byDate = Object.fromEntries(points.map((p) => [p.date, p.xp]));

    expect(byDate['2026-08-04']).toBe(100 + 40 + 50);
    expect(byDate['2026-08-01']).toBe(20);
    expect(byDate['2026-07-30']).toBe(50);
    expect(byDate['2026-07-31']).toBe(0);
  });

  it('ignora lo que cae fuera de la ventana de siete días', () => {
    const points = weeklyXp(
      [{ date: '2026-07-20', priority: 'high' }],
      ['2026-07-20'],
      '2026-08-04',
    );

    expect(points.every((point) => point.xp === 0)).toBe(true);
  });
});

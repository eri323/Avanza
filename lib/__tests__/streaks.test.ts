import { describe, expect, it } from 'vitest';
import {
  bestStreak,
  currentStreak,
  globalStreak,
  monthlyCompletion,
  type Cadence,
} from '../streaks';

const daily: Cadence = { type: 'daily' };
const weekly3: Cadence = { type: 'weekly', targetPerWeek: 3 };

describe('currentStreak — cadencia diaria', () => {
  it('devuelve 0 sin entradas', () => {
    expect(currentStreak([], daily, '2026-08-01')).toBe(0);
  });

  it('devuelve 1 cuando sólo se marcó hoy', () => {
    expect(currentStreak(['2026-08-01'], daily, '2026-08-01')).toBe(1);
  });

  it('cuenta días consecutivos terminando hoy', () => {
    const entries = ['2026-07-30', '2026-07-31', '2026-08-01'];
    expect(currentStreak(entries, daily, '2026-08-01')).toBe(3);
  });

  it('no rompe la racha si hoy aún no se marca', () => {
    const entries = ['2026-07-30', '2026-07-31'];
    expect(currentStreak(entries, daily, '2026-08-01')).toBe(2);
  });

  it('rompe la racha cuando faltan dos días seguidos', () => {
    const entries = ['2026-07-28', '2026-07-29'];
    expect(currentStreak(entries, daily, '2026-08-01')).toBe(0);
  });

  it('ignora los días anteriores a un hueco', () => {
    const entries = ['2026-07-20', '2026-07-21', '2026-07-31', '2026-08-01'];
    expect(currentStreak(entries, daily, '2026-08-01')).toBe(2);
  });

  it('no depende del orden de las entradas', () => {
    const entries = ['2026-08-01', '2026-07-30', '2026-07-31'];
    expect(currentStreak(entries, daily, '2026-08-01')).toBe(3);
  });

  it('ignora fechas futuras', () => {
    const entries = ['2026-08-01', '2026-08-05'];
    expect(currentStreak(entries, daily, '2026-08-01')).toBe(1);
  });
});

describe('currentStreak — cadencia semanal', () => {
  // Semanas ISO (lunes): 2026-07-20, 2026-07-27, 2026-08-03.
  it('devuelve 0 sin entradas', () => {
    expect(currentStreak([], weekly3, '2026-08-05')).toBe(0);
  });

  it('cuenta la semana en curso si ya alcanzó la meta', () => {
    const entries = ['2026-08-03', '2026-08-04', '2026-08-05'];
    expect(currentStreak(entries, weekly3, '2026-08-05')).toBe(1);
  });

  it('no cuenta la semana en curso si aún no alcanza la meta', () => {
    const entries = ['2026-08-03', '2026-08-04'];
    expect(currentStreak(entries, weekly3, '2026-08-05')).toBe(0);
  });

  it('no rompe la racha por una semana en curso incompleta', () => {
    const previa = ['2026-07-27', '2026-07-28', '2026-07-29'];
    const enCurso = ['2026-08-03'];
    expect(currentStreak([...previa, ...enCurso], weekly3, '2026-08-05')).toBe(1);
  });

  it('cuenta semanas consecutivas que cumplieron la meta', () => {
    const entries = [
      '2026-07-20', '2026-07-21', '2026-07-22',
      '2026-07-27', '2026-07-28', '2026-07-29',
      '2026-08-03', '2026-08-04', '2026-08-05',
    ];
    expect(currentStreak(entries, weekly3, '2026-08-05')).toBe(3);
  });

  it('rompe la racha en una semana pasada que no cumplió', () => {
    const entries = [
      '2026-07-20', '2026-07-21', '2026-07-22',
      '2026-07-27',
      '2026-08-03', '2026-08-04', '2026-08-05',
    ];
    expect(currentStreak(entries, weekly3, '2026-08-05')).toBe(1);
  });

  it('superar la meta no cuenta doble', () => {
    const entries = [
      '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07',
    ];
    expect(currentStreak(entries, weekly3, '2026-08-07')).toBe(1);
  });
});

describe('bestStreak', () => {
  it('encuentra la racha más larga aunque no sea la actual', () => {
    const dates = [
      '2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04',
      '2026-07-20',
    ];

    expect(bestStreak(dates, { type: 'daily' }, '2026-07-20')).toBe(4);
  });

  it('sin marcas devuelve cero', () => {
    expect(bestStreak([], { type: 'daily' }, '2026-08-04')).toBe(0);
  });

  it('ignora las marcas posteriores a hoy', () => {
    expect(
      bestStreak(['2026-08-04', '2026-08-05', '2026-08-06'], { type: 'daily' }, '2026-08-04'),
    ).toBe(1);
  });

  it('en semanal cuenta semanas que cumplieron la meta', () => {
    const dates = [
      // Semana del 2026-07-13: 2 marcas, cumple.
      '2026-07-13', '2026-07-15',
      // Semana del 2026-07-20: 2 marcas, cumple.
      '2026-07-20', '2026-07-22',
      // Semana del 2026-07-27: 1 marca, no cumple.
      '2026-07-27',
    ];

    expect(
      bestStreak(dates, { type: 'weekly', targetPerWeek: 2 }, '2026-07-31'),
    ).toBe(2);
  });
});

describe('monthlyCompletion', () => {
  it('en diario es marcas del mes sobre días transcurridos', () => {
    const dates = ['2026-08-01', '2026-08-02', '2026-08-04'];

    expect(monthlyCompletion(dates, { type: 'daily' }, '2026-08-04')).toBe(75);
  });

  it('no cuenta las marcas de otro mes', () => {
    const dates = ['2026-07-31', '2026-08-01'];

    expect(monthlyCompletion(dates, { type: 'daily' }, '2026-08-02')).toBe(50);
  });

  it('en semanal prorratea la meta por días transcurridos, sin saltar al empezar semana', () => {
    // 8 días transcurridos → meta prorrateada 8/7 × 3 = 3,428…
    const dates = ['2026-08-01', '2026-08-02', '2026-08-08'];

    expect(
      monthlyCompletion(dates, { type: 'weekly', targetPerWeek: 3 }, '2026-08-08'),
    ).toBe(88);
  });

  it('en semanal el tope evita pasar del 100 cuando el prorrateo desbordaría', () => {
    // meta prorrateada 6/7 × 2 = 1,714…; 4 marcas darían ~233% sin el tope.
    const dates = ['2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06'];

    expect(
      monthlyCompletion(dates, { type: 'weekly', targetPerWeek: 2 }, '2026-08-06'),
    ).toBe(100);
  });

  it('sin marcas es cero', () => {
    expect(monthlyCompletion([], { type: 'daily' }, '2026-08-04')).toBe(0);
  });
});

describe('globalStreak', () => {
  it('un día cuenta si se marcó cualquier hábito', () => {
    const streak = globalStreak(
      [
        ['2026-08-04', '2026-08-02'],
        ['2026-08-03'],
      ],
      '2026-08-04',
    );

    expect(streak).toBe(3);
  });

  it('sin hábitos es cero', () => {
    expect(globalStreak([], '2026-08-04')).toBe(0);
  });
});

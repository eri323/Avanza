import { describe, expect, it } from 'vitest';
import { currentStreak, type Cadence } from '../streaks';

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

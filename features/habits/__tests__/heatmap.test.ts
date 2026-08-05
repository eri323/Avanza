import { describe, expect, it } from 'vitest';
import { heatColumns, weekDots } from '../heatmap';

describe('heatColumns', () => {
  it('devuelve una columna por semana, de siete celdas', () => {
    const columns = heatColumns([], '2026-08-04', 5);

    expect(columns).toHaveLength(5);
    expect(columns.every((column) => column.length === 7)).toBe(true);
  });

  it('la última columna es la semana de hoy', () => {
    const columns = heatColumns(['2026-08-04'], '2026-08-04', 5);
    const lastWeek = columns[4];

    // 2026-08-04 es martes: segunda celda de la columna.
    expect(lastWeek[1].level).toBe(1);
    expect(lastWeek[0].level).toBe(0);
  });

  it('marca como fuera de rango los días posteriores a hoy', () => {
    const columns = heatColumns([], '2026-08-04', 5);
    const lastWeek = columns[4];

    expect(lastWeek[2].level).toBe(2);
    expect(lastWeek[6].level).toBe(2);
  });

  it('cada celda lleva una etiqueta legible', () => {
    const columns = heatColumns(['2026-08-03'], '2026-08-04', 1);

    expect(columns[0][0].label).toBe('2026-08-03: cumplido');
    expect(columns[0][1].label).toBe('2026-08-04: sin marcar');
    expect(columns[0][2].label).toBe('2026-08-05: aún no');
  });
});

describe('weekDots', () => {
  it('devuelve siete puntos de lunes a domingo', () => {
    const dots = weekDots([], '2026-08-04');

    expect(dots).toHaveLength(7);
    expect(dots[0].date).toBe('2026-08-03');
    expect(dots[6].date).toBe('2026-08-09');
    expect(dots.map((dot) => dot.letter)).toEqual([
      'L', 'M', 'X', 'J', 'V', 'S', 'D',
    ]);
  });

  it('distingue marcado, hoy y futuro', () => {
    const dots = weekDots(['2026-08-03'], '2026-08-04');

    expect(dots[0]).toMatchObject({ done: true, isToday: false, isFuture: false });
    expect(dots[1]).toMatchObject({ done: false, isToday: true, isFuture: false });
    expect(dots[2]).toMatchObject({ done: false, isToday: false, isFuture: true });
  });
});

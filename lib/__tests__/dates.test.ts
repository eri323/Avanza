import { describe, expect, it } from 'vitest';
import {
  addDays,
  bucketFor,
  diffInDays,
  isoWeekStart,
  todayIn,
} from '../dates';

describe('todayIn', () => {
  it('devuelve la fecha local, no la UTC, cuando la zona va detrás', () => {
    // 2026-08-02 03:00 UTC = 2026-08-01 21:00 en Ciudad de México.
    const now = new Date('2026-08-02T03:00:00Z');
    expect(todayIn('America/Mexico_City', now)).toBe('2026-08-01');
  });

  it('devuelve el día siguiente cuando la zona va adelante de UTC', () => {
    // 2026-08-01 20:00 UTC = 2026-08-02 05:00 en Tokio.
    const now = new Date('2026-08-01T20:00:00Z');
    expect(todayIn('Asia/Tokyo', now)).toBe('2026-08-02');
  });

  it('coincide con UTC cuando la zona es UTC', () => {
    const now = new Date('2026-08-01T20:00:00Z');
    expect(todayIn('UTC', now)).toBe('2026-08-01');
  });
});

describe('addDays', () => {
  it('avanza días', () => {
    expect(addDays('2026-08-01', 5)).toBe('2026-08-06');
  });

  it('retrocede días', () => {
    expect(addDays('2026-08-01', -1)).toBe('2026-07-31');
  });

  it('cruza el fin de año', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('maneja años bisiestos', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('no se corre al cruzar un cambio de horario de verano', () => {
    // Fin de semana de cambio de horario en varias zonas.
    expect(addDays('2026-03-07', 1)).toBe('2026-03-08');
    expect(addDays('2026-03-08', 1)).toBe('2026-03-09');
  });
});

describe('diffInDays', () => {
  it('cuenta días hacia adelante', () => {
    expect(diffInDays('2026-08-01', '2026-08-04')).toBe(3);
  });

  it('devuelve negativo hacia atrás', () => {
    expect(diffInDays('2026-08-04', '2026-08-01')).toBe(-3);
  });

  it('devuelve cero para el mismo día', () => {
    expect(diffInDays('2026-08-01', '2026-08-01')).toBe(0);
  });
});

describe('isoWeekStart', () => {
  it('devuelve el lunes de la semana', () => {
    // 2026-08-01 es sábado.
    expect(isoWeekStart('2026-08-01')).toBe('2026-07-27');
  });

  it('devuelve el mismo día si ya es lunes', () => {
    expect(isoWeekStart('2026-07-27')).toBe('2026-07-27');
  });

  it('trata el domingo como fin de semana, no como inicio', () => {
    // 2026-08-02 es domingo; pertenece a la semana que empezó el 27.
    expect(isoWeekStart('2026-08-02')).toBe('2026-07-27');
  });
});

describe('bucketFor', () => {
  const today = '2026-08-01';

  it('clasifica sin fecha como someday', () => {
    expect(bucketFor(null, today)).toBe('someday');
  });

  it('clasifica una fecha pasada como overdue', () => {
    expect(bucketFor('2026-07-31', today)).toBe('overdue');
  });

  it('clasifica hoy como today', () => {
    expect(bucketFor(today, today)).toBe('today');
  });

  it('clasifica una fecha futura como upcoming', () => {
    expect(bucketFor('2026-08-02', today)).toBe('upcoming');
  });
});

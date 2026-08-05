import { describe, expect, it } from 'vitest';
import {
  createHabitSchema,
  createProjectSchema,
  createTaskSchema,
} from '../validation';
import { messageForDbError } from '../result';

describe('createTaskSchema', () => {
  it('acepta una tarea mínima', () => {
    const result = createTaskSchema.safeParse({ title: 'Escribir spec' });
    expect(result.success).toBe(true);
  });

  it('recorta espacios del título', () => {
    const result = createTaskSchema.parse({ title: '  Comprar pan  ' });
    expect(result.title).toBe('Comprar pan');
  });

  it('rechaza un título vacío o de sólo espacios', () => {
    expect(createTaskSchema.safeParse({ title: '   ' }).success).toBe(false);
  });

  it('rechaza un título de más de 200 caracteres', () => {
    const largo = 'a'.repeat(201);
    expect(createTaskSchema.safeParse({ title: largo }).success).toBe(false);
  });

  it('rechaza una fecha que no sea YYYY-MM-DD', () => {
    const result = createTaskSchema.safeParse({
      title: 'Tarea',
      dueDate: '01/08/2026',
    });
    expect(result.success).toBe(false);
  });

  it('acepta una fecha ISO válida', () => {
    const result = createTaskSchema.safeParse({
      title: 'Tarea',
      dueDate: '2026-08-01',
    });
    expect(result.success).toBe(true);
  });

  it('normaliza cadena vacía de fecha a null', () => {
    const result = createTaskSchema.parse({ title: 'Tarea', dueDate: '' });
    expect(result.dueDate).toBeNull();
  });
});

describe('createProjectSchema', () => {
  it('acepta un color hexadecimal', () => {
    const result = createProjectSchema.safeParse({
      name: 'Portafolio',
      color: '#6366F1',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza un color que no sea hexadecimal de 6 dígitos', () => {
    const result = createProjectSchema.safeParse({
      name: 'Portafolio',
      color: 'azul',
    });
    expect(result.success).toBe(false);
  });
});

describe('createHabitSchema', () => {
  it('acepta un hábito diario sin meta semanal', () => {
    const result = createHabitSchema.safeParse({
      name: 'Leer',
      cadence: 'daily',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza un hábito semanal sin meta', () => {
    const result = createHabitSchema.safeParse({
      name: 'Gym',
      cadence: 'weekly',
    });
    expect(result.success).toBe(false);
  });

  it('acepta un hábito semanal con meta', () => {
    const result = createHabitSchema.safeParse({
      name: 'Gym',
      cadence: 'weekly',
      targetPerWeek: 3,
    });
    expect(result.success).toBe(true);
  });

  it('rechaza una meta mayor a 7', () => {
    const result = createHabitSchema.safeParse({
      name: 'Gym',
      cadence: 'weekly',
      targetPerWeek: 8,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza una meta semanal en un hábito diario', () => {
    const result = createHabitSchema.safeParse({
      name: 'Leer',
      cadence: 'daily',
      targetPerWeek: 3,
    });
    expect(result.success).toBe(false);
  });
});

describe('icon', () => {
  // El emoji de familia: cuatro emojis de dos unidades UTF-16 más tres ZWJ =
  // 11 unidades, pero sólo 7 puntos de código. Se arma con escapes porque el
  // ZWJ es invisible y no debe depender de cómo guarde el editor este archivo.
  const ZWJ = String.fromCodePoint(0x200d);
  const FAMILIA = `\u{1F468}${ZWJ}\u{1F469}${ZWJ}\u{1F467}${ZWJ}\u{1F466}`;

  const parseIcon = (icon: string) =>
    createHabitSchema.safeParse({ name: 'Leer', cadence: 'daily', icon });

  it('acepta un emoji simple', () => {
    const result = parseIcon('\u{1F4DA}');
    expect(result.success).toBe(true);
  });

  it('acepta un emoji compuesto de varios puntos de código', () => {
    // El límite se mide en puntos de código: contarlo en unidades UTF-16
    // rechazaría la familia, que es justo el caso que el límite dice cubrir.
    expect(FAMILIA.length).toBe(11);
    expect([...FAMILIA].length).toBe(7);

    const result = parseIcon(FAMILIA);
    expect(result.success).toBe(true);
    expect(result.success && result.data.icon).toBe(FAMILIA);
  });

  it('normaliza cadena vacía a null', () => {
    const result = createHabitSchema.parse({
      name: 'Leer',
      cadence: 'daily',
      icon: '',
    });
    expect(result.icon).toBeNull();
  });

  it('rechaza más de 8 puntos de código', () => {
    const result = parseIcon('\u{1F642}'.repeat(9));
    expect(result.success).toBe(false);
  });
});

describe('messageForDbError', () => {
  it('traduce el día duplicado', () => {
    expect(messageForDbError('23505')).toBe('Ese día ya estaba marcado.');
  });

  it('traduce la fecha futura', () => {
    expect(messageForDbError('22007')).toBe(
      'No puedes marcar un hábito en una fecha futura.',
    );
  });

  it('traduce la zona horaria inválida', () => {
    expect(messageForDbError('22023')).toBe('Esa zona horaria no existe.');
  });

  it('da un mensaje genérico para códigos desconocidos', () => {
    expect(messageForDbError('XX999')).toBe(
      'Algo salió mal. Intenta de nuevo.',
    );
  });

  it('da un mensaje genérico cuando no hay código', () => {
    expect(messageForDbError(undefined)).toBe(
      'Algo salió mal. Intenta de nuevo.',
    );
  });
});

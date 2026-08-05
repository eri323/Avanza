import { describe, expect, it } from 'vitest';
import { greetingFor } from '@/lib/greeting';

describe('greetingFor', () => {
  it('reparte el día en tres tramos', () => {
    expect(greetingFor(0)).toBe('Buenas noches');
    expect(greetingFor(5)).toBe('Buenos días');
    expect(greetingFor(11)).toBe('Buenos días');
    expect(greetingFor(12)).toBe('Buenas tardes');
    expect(greetingFor(19)).toBe('Buenas tardes');
    expect(greetingFor(20)).toBe('Buenas noches');
    expect(greetingFor(23)).toBe('Buenas noches');
  });
});

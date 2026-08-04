import { describe, expect, it } from 'vitest';
import { resolveTheme } from '@/lib/theme';

describe('resolveTheme', () => {
  it('respeta lo guardado por encima de la preferencia del sistema', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('cae en la preferencia del sistema cuando no hay nada guardado', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });

  it('trata un valor corrupto como si no hubiera nada guardado', () => {
    expect(resolveTheme('violeta', true)).toBe('dark');
    expect(resolveTheme('', false)).toBe('light');
  });
});

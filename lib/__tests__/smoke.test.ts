import { describe, expect, it } from 'vitest';
import { projectName } from '../meta';

describe('arnés de pruebas', () => {
  it('resuelve imports con el alias del proyecto', () => {
    expect(projectName).toBe('Avanza');
  });
});

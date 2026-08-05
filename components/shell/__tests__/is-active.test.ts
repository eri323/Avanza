import { describe, expect, it } from 'vitest';
import { isActive } from '../is-active';

describe('isActive', () => {
  it('marca el destino exacto', () => {
    expect(isActive('/tareas', '/tareas')).toBe(true);
  });

  it('marca el destino cuando se está en una subruta', () => {
    expect(isActive('/tareas/8f3c', '/tareas')).toBe(true);
    expect(isActive('/habitos/8f3c', '/habitos')).toBe(true);
  });

  it('no confunde rutas que comparten prefijo de texto', () => {
    expect(isActive('/tareasplus', '/tareas')).toBe(false);
    expect(isActive('/proyectos', '/progreso')).toBe(false);
  });

  it('no marca destinos ajenos', () => {
    expect(isActive('/inicio', '/perfil')).toBe(false);
  });
});

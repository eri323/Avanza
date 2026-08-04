import { describe, expect, it } from 'vitest';
import { groupTasks } from '../grouping';
import type { Task } from '../types';

function task(id: string, dueDate: string | null): Task {
  return {
    id,
    title: `Tarea ${id}`,
    notes: null,
    dueDate,
    projectId: null,
    priority: 'none',
    completedAt: null,
  };
}

describe('groupTasks', () => {
  const today = '2026-08-01';

  it('devuelve los cuatro grupos vacíos sin tareas', () => {
    const result = groupTasks([], today);
    expect(result).toEqual({ overdue: [], today: [], upcoming: [], someday: [] });
  });

  it('reparte cada tarea en su grupo', () => {
    const tasks = [
      task('a', '2026-07-30'),
      task('b', '2026-08-01'),
      task('c', '2026-08-05'),
      task('d', null),
    ];

    const result = groupTasks(tasks, today);

    expect(result.overdue.map((t) => t.id)).toEqual(['a']);
    expect(result.today.map((t) => t.id)).toEqual(['b']);
    expect(result.upcoming.map((t) => t.id)).toEqual(['c']);
    expect(result.someday.map((t) => t.id)).toEqual(['d']);
  });

  it('ordena las vencidas de más antigua a más reciente', () => {
    const tasks = [task('nueva', '2026-07-31'), task('vieja', '2026-07-01')];
    const result = groupTasks(tasks, today);
    expect(result.overdue.map((t) => t.id)).toEqual(['vieja', 'nueva']);
  });

  it('ordena las próximas de más cercana a más lejana', () => {
    const tasks = [task('lejos', '2026-09-01'), task('cerca', '2026-08-02')];
    const result = groupTasks(tasks, today);
    expect(result.upcoming.map((t) => t.id)).toEqual(['cerca', 'lejos']);
  });

  it('excluye las tareas ya completadas', () => {
    const completada: Task = { ...task('x', '2026-08-01'), completedAt: '2026-08-01T10:00:00Z' };
    const result = groupTasks([completada], today);
    expect(result.today).toEqual([]);
  });
});

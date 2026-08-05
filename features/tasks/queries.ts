import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { IsoDate } from '@/lib/dates';
import type { Task } from './types';

const COLUMNS = 'id, title, notes, due_date, project_id, priority, completed_at';

/** Forma de un UUID (8-4-4-4-12 hex, sin distinguir mayúsculas), sin exigir
 *  versión ni variante concretas: Postgres acepta cualquier UUID válido y esta
 *  guarda no debe ser más estricta que la base. */
const UUID_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Row = {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  project_id: string | null;
  priority: Task['priority'];
  completed_at: string | null;
};

function toTask(row: Row): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    dueDate: row.due_date,
    projectId: row.project_id,
    priority: row.priority,
    completedAt: row.completed_at,
  };
}

export async function listPendingTasks(): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select(COLUMNS)
    .is('completed_at', null)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('position', { ascending: true });

  if (error) throw error;
  return data.map(toTask);
}

export async function listTasksForProject(projectId: string): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select(COLUMNS)
    .eq('project_id', projectId)
    .order('completed_at', { ascending: true, nullsFirst: true })
    .order('due_date', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data.map(toTask);
}

/**
 * El "pozo del día": todo lo que vencía hoy o antes, completado o no.
 *
 * Incluye las completadas a propósito: la meta del día es todo el XP disponible
 * hoy, y una tarea que ya se marcó sigue formando parte de esa meta. Si sólo se
 * trajeran las pendientes, la barra se vaciaría al completar en vez de llenarse.
 */
export async function listDueUpToToday(today: IsoDate): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select(COLUMNS)
    .lte('due_date', today)
    .order('due_date', { ascending: true })
    .order('position', { ascending: true });

  if (error) throw error;
  return data.map(toTask);
}

/** `null` y no error cuando no existe: RLS hace que una tarea ajena se vea
 *  igual que una borrada, y la pantalla responde con notFound() en los dos casos.
 *
 *  Un `id` sin forma de UUID se rechaza antes de tocar la base: Postgres
 *  respondería `22P02` (sintaxis de entrada inválida para uuid), el `throw
 *  error` de abajo lo propagaría, y la pantalla de detalle acabaría en un 500
 *  en vez de un 404. Un id malformado no puede existir, así que cae en el
 *  mismo caso que "no existe". */
export async function getTaskById(id: string): Promise<Task | null> {
  if (!UUID_SHAPE.test(id)) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? toTask(data) : null;
}

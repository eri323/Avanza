import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type Project = {
  id: string;
  name: string;
  color: string;
};

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient();

  // RLS ya filtra por usuario; no hace falta un .eq('user_id', ...).
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, color')
    .is('archived_at', null)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export type ProjectWithCount = Project & { pendingCount: number };

/**
 * Proyectos con su conteo de tareas pendientes, para la barra lateral y los
 * chips de filtro.
 *
 * Dos consultas y el conteo en memoria: agregarlo en SQL exigiría una vista o
 * una función, y este bloque tiene un solo cambio de esquema permitido.
 */
export async function listProjectsWithCounts(): Promise<ProjectWithCount[]> {
  const supabase = await createClient();

  const [projects, pending] = await Promise.all([
    listProjects(),
    supabase.from('tasks').select('project_id').is('completed_at', null),
  ]);

  if (pending.error) throw pending.error;

  const counts = new Map<string, number>();
  for (const row of pending.data) {
    if (row.project_id === null) continue;
    counts.set(row.project_id, (counts.get(row.project_id) ?? 0) + 1);
  }

  return projects.map((project) => ({
    ...project,
    pendingCount: counts.get(project.id) ?? 0,
  }));
}

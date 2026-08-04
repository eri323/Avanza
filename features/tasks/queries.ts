import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Task } from './types';

const COLUMNS = 'id, title, notes, due_date, project_id, priority, completed_at';

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

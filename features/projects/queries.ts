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

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createTaskSchema } from '@/lib/validation';
import { fail, messageForDbError, ok, type ActionResult } from '@/lib/result';

function revalidateTaskViews() {
  revalidatePath('/hoy');
  revalidatePath('/tareas');
  revalidatePath('/proyectos', 'layout');
}

export async function createTask(
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = createTaskSchema.safeParse({
    title: formData.get('title'),
    dueDate: formData.get('dueDate') ?? undefined,
    projectId: formData.get('projectId') || null,
    priority: formData.get('priority') ?? undefined,
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail('Tu sesión expiró.');

  const { error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title: parsed.data.title,
    notes: parsed.data.notes,
    due_date: parsed.data.dueDate,
    project_id: parsed.data.projectId,
    priority: parsed.data.priority,
  });

  if (error) return fail(messageForDbError(error.code));

  revalidateTaskViews();
  return ok();
}

export async function setTaskCompleted(
  id: string,
  completed: boolean,
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('tasks')
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq('id', id);

  if (error) return fail(messageForDbError(error.code));

  revalidateTaskViews();
  return ok();
}

export async function deleteTask(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) return fail(messageForDbError(error.code));

  revalidateTaskViews();
  return ok();
}

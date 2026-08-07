'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createProjectSchema } from '@/lib/validation';
import { fail, messageForDbError, ok, type ActionResult } from '@/lib/result';

export async function createProject(
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = createProjectSchema.safeParse({
    name: formData.get('name'),
    color: formData.get('color') ?? undefined,
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail('Tu sesión expiró.');

  const { error } = await supabase.from('projects').insert({
    user_id: user.id,
    name: parsed.data.name,
    color: parsed.data.color,
  });

  if (error) return fail(messageForDbError(error.code));

  revalidatePath('/proyectos', 'layout');
  return ok();
}

/** Archivar y no borrar: las tareas del proyecto se conservan. */
export async function archiveProject(id: string): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('projects')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return fail(messageForDbError(error.code));

  revalidatePath('/proyectos', 'layout');
  return ok();
}

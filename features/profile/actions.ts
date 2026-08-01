'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { timezoneSchema } from '@/lib/validation';
import { fail, messageForDbError, ok, type ActionResult } from '@/lib/result';

export async function updateTimezone(
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = timezoneSchema.safeParse(formData.get('timezone'));
  if (!parsed.success) return fail('Zona horaria inválida.');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail('Tu sesión expiró.');

  const { error } = await supabase
    .from('profiles')
    .update({ timezone: parsed.data })
    .eq('id', user.id);

  if (error) return fail(messageForDbError(error.code));

  revalidatePath('/', 'layout');
  return ok();
}

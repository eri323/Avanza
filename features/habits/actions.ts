'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createHabitSchema } from '@/lib/validation';
import { fail, messageForDbError, ok, type ActionResult } from '@/lib/result';
import type { IsoDate } from '@/lib/dates';

function revalidateHabitViews() {
  revalidatePath('/inicio');
  revalidatePath('/habitos', 'layout');
  revalidatePath('/progreso');
}

export async function createHabit(
  formData: FormData,
): Promise<ActionResult<void>> {
  const cadence = formData.get('cadence');
  const rawTarget = formData.get('targetPerWeek');

  const parsed = createHabitSchema.safeParse({
    name: formData.get('name'),
    color: formData.get('color') ?? undefined,
    icon: formData.get('icon') ?? undefined,
    cadence,
    // Un hábito diario no lleva meta; mandarla en cero rompería el CHECK.
    targetPerWeek: cadence === 'weekly' && rawTarget ? rawTarget : null,
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail('Tu sesión expiró.');

  const { error } = await supabase.from('habits').insert({
    user_id: user.id,
    name: parsed.data.name,
    color: parsed.data.color,
    icon: parsed.data.icon,
    cadence: parsed.data.cadence,
    target_per_week: parsed.data.targetPerWeek ?? null,
  });

  if (error) return fail(messageForDbError(error.code));

  revalidateHabitViews();
  return ok();
}

/**
 * Marca o desmarca un día. `habit_entries` no admite UPDATE por diseño: marcar
 * es un INSERT y desmarcar un DELETE.
 */
export async function toggleHabitEntry(
  habitId: string,
  date: IsoDate,
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail('Tu sesión expiró.');

  const { data: existing, error: readError } = await supabase
    .from('habit_entries')
    .select('id')
    .eq('habit_id', habitId)
    .eq('entry_date', date)
    .maybeSingle();

  if (readError) return fail(messageForDbError(readError.code));

  if (existing) {
    const { error } = await supabase
      .from('habit_entries')
      .delete()
      .eq('id', existing.id);
    if (error) return fail(messageForDbError(error.code));
  } else {
    const { error } = await supabase.from('habit_entries').insert({
      habit_id: habitId,
      user_id: user.id,
      entry_date: date,
    });
    if (error) return fail(messageForDbError(error.code));
  }

  revalidateHabitViews();
  return ok();
}

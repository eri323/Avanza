import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { todayIn, type IsoDate } from '@/lib/dates';

export type Profile = {
  id: string;
  displayName: string | null;
  timezone: string;
};

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Sin sesión');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, timezone')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    displayName: data.display_name,
    timezone: data.timezone,
  };
}

/**
 * El "hoy" del usuario. Todas las pantallas dependen de esto y nunca de
 * `new Date()` en el servidor, que devolvería la fecha del servidor —UTC en
 * Vercel— y no la del usuario.
 */
export async function getTodayForUser(): Promise<IsoDate> {
  const { timezone } = await getProfile();
  return todayIn(timezone);
}

import { createClient } from '@/lib/supabase/server';

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Hoy</h1>
      <p className="text-sm text-neutral-500">Sesión de {user?.email}</p>
    </main>
  );
}

import { getProfile } from '@/features/profile';
import { TimezoneForm } from './timezone-form';

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-8 p-6">
      <h1 className="text-xl font-semibold">Perfil</h1>

      <TimezoneForm current={profile.timezone} />

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}

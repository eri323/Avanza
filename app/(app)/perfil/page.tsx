import Link from 'next/link';
import { ChevronRightIcon, FolderIcon } from '@/components/ui';
import { ThemeToggle } from '@/components/shell/theme-toggle';
import { getProfile } from '@/features/profile';
import { TimezoneForm } from './timezone-form';

export default async function ProfilePage() {
  const profile = await getProfile();

  const name = profile.displayName?.trim();
  const initial = (name ?? profile.email).charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display text-text">Perfil</h1>

      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="bg-brand-gradient grid size-16 shrink-0 place-items-center rounded-xl text-title text-white"
        >
          {initial}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-heading text-text">
            {name ?? 'Sin nombre'}
          </span>
          <span className="truncate text-label text-text-muted">
            {profile.email}
          </span>
        </div>
      </div>

      <TimezoneForm current={profile.timezone} />

      <ThemeToggle />

      <Link
        href="/proyectos"
        className="flex items-center gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3.5 transition-colors hover:border-accent/40"
      >
        <FolderIcon className="size-5 text-accent" />
        <span className="flex-1 text-label text-text">Proyectos</span>
        <ChevronRightIcon className="size-5 text-text-muted" />
      </Link>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="w-full rounded-md border border-border px-4 py-3.5 text-label text-text transition-colors hover:border-accent-warm/40"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

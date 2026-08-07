'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderIcon, PlusIcon } from '@/components/ui';
import type { ProjectWithCount } from '@/features/projects';
import { useCapture } from './capture-provider';
import { isActive } from './is-active';
import { NAV_ITEMS } from './nav-items';

export function Sidebar({ projects }: { projects: ProjectWithCount[] }) {
  const pathname = usePathname();
  const { open } = useCapture();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-6 border-r border-border bg-surface-elevated px-4 py-6 lg:flex">
      <div className="flex flex-col gap-4 px-2">
        <span className="text-title text-text">Avanza</span>
        {/* En escritorio el FAB pasa a ser este botón: mismo componente Sheet,
            otra posición. No hay dos implementaciones de la captura. */}
        <button
          type="button"
          onClick={() => open('task')}
          className="bg-brand-gradient flex items-center justify-center gap-2 rounded-md py-3 text-label text-white shadow-glow transition-transform active:scale-[0.98]"
        >
          <PlusIcon className="size-5" />
          Añadir
        </button>
      </div>

      <nav aria-label="Navegación principal" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-label transition-colors ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-soft hover:bg-surface-sunken'
              }`}
            >
              <Icon className="size-5" />
              {/* El icono sí puede llevar `text-accent` (relleno, permitido).
                  La etiqueta es texto pequeño (13px) y esencial: `accent`
                  sobre el tinte `bg-accent/10` da 3.53:1–3.75:1, bajo AA. Se
                  distingue por peso, no por tono. Tarea 33. */}
              <span className={active ? 'font-bold text-text' : ''}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <span className="px-3 text-caption uppercase text-text-muted">
          Proyectos
        </span>
        {projects.length === 0 ? (
          <p className="px-3 text-label text-text-muted">Todavía ninguno.</p>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/proyectos/${project.id}`}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-label text-text-soft transition-colors hover:bg-surface-sunken"
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-xl"
                style={{ backgroundColor: project.color }}
              />
              <span className="min-w-0 flex-1 truncate">{project.name}</span>
              <span className="text-caption text-text-muted">
                {project.pendingCount}
              </span>
            </Link>
          ))
        )}
      </div>

      <Link
        href="/proyectos"
        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-label text-text-soft transition-colors hover:bg-surface-sunken"
      >
        <FolderIcon className="size-5" />
        Gestionar proyectos
      </Link>
    </aside>
  );
}

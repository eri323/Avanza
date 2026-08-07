'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActive } from './is-active';
import { NAV_ITEMS } from './nav-items';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface-elevated/95 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                  active ? 'text-accent' : 'text-text-muted'
                }`}
              >
                <Icon className="size-6" />
                {/* El icono sí puede llevar `text-accent` (relleno, permitido por
                    las reglas de color). La etiqueta es texto pequeño (11px) y
                    esencial: `accent` da 3.96:1–4.23:1 sobre `elevated`, bajo
                    AA. Se distingue por peso, no por tono. Tarea 33. */}
                <span
                  className={`text-[0.6875rem] leading-none ${
                    active ? 'font-bold text-text' : ''
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

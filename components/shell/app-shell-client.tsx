'use client';

import type { IsoDate } from '@/lib/dates';
import type { ProjectWithCount } from '@/features/projects';
import { BottomNav } from './bottom-nav';
import { CaptureLauncher } from './capture-launcher';
import { CaptureProvider } from './capture-provider';
import { Sidebar } from './sidebar';

/**
 * El layout se decide por CSS: `lg:pl-64` reserva el hueco de la barra lateral
 * y las dos barras se muestran u ocultan con `lg:hidden` / `hidden lg:flex`.
 * Ni `matchMedia` ni detección de ancho en el servidor: no hay estado que
 * hidratar y por eso no hay salto visual al cargar.
 */
export function AppShellClient({
  projects,
  today,
  children,
}: {
  projects: ProjectWithCount[];
  today: IsoDate;
  children: React.ReactNode;
}) {
  return (
    <CaptureProvider projects={projects} today={today}>
      <div className="min-h-dvh bg-surface">
        <Sidebar projects={projects} />
        <div className="lg:pl-64">
          <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 lg:px-8 lg:pb-12">
            {children}
          </main>
        </div>
        <CaptureLauncher />
        <BottomNav />
      </div>
    </CaptureProvider>
  );
}

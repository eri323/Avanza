import { getTodayForUser } from '@/features/profile';
import { listProjectsWithCounts } from '@/features/projects';
import { AppShellClient } from './app-shell-client';

/**
 * Componente de servidor: trae una sola vez los proyectos que necesitan la
 * barra lateral y la hoja de captura, y el "hoy" del usuario que usan los chips
 * de fecha. Sin esto, cada consumidor lo pediría por su cuenta.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const [projects, today] = await Promise.all([
    listProjectsWithCounts(),
    getTodayForUser(),
  ]);

  return (
    <AppShellClient projects={projects} today={today}>
      {children}
    </AppShellClient>
  );
}

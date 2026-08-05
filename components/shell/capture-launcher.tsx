'use client';

import { usePathname } from 'next/navigation';
import { Fab } from '@/components/ui';
import { useCapture } from './capture-provider';

/** Las tres pantallas donde el prototipo pone el FAB. En Progreso y Perfil no
 *  hay nada que capturar y un botón flotante ahí sólo taparía contenido. */
const FAB_ROUTES = ['/inicio', '/tareas', '/habitos'];

export function CaptureLauncher() {
  const pathname = usePathname();
  const { open } = useCapture();

  if (!FAB_ROUTES.includes(pathname)) return null;

  return <Fab label="Añadir tarea o hábito" onClick={() => open('task')} />;
}

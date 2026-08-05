'use client';

import { createContext, useContext, useState } from 'react';
import type { IsoDate } from '@/lib/dates';
import type { ProjectWithCount } from '@/features/projects';
import { CaptureSheet } from './capture-sheet';

export type CaptureTab = 'task' | 'habit';

type CaptureValue = { open: (tab?: CaptureTab) => void };

const CaptureContext = createContext<CaptureValue | null>(null);

export function useCapture(): CaptureValue {
  const value = useContext(CaptureContext);
  if (!value) throw new Error('useCapture se usó fuera de CaptureProvider');
  return value;
}

/**
 * Un único punto de entrada para crear.
 *
 * El estado vive aquí y no en cada botón porque el FAB de móvil y el "Añadir"
 * de la barra lateral abren la misma hoja: si cada uno tuviera la suya, el FAB
 * dejaría de significar siempre lo mismo.
 */
export function CaptureProvider({
  projects,
  today,
  children,
}: {
  projects: ProjectWithCount[];
  today: IsoDate;
  children: React.ReactNode;
}) {
  const [tab, setTab] = useState<CaptureTab | null>(null);

  return (
    <CaptureContext.Provider value={{ open: (next = 'task') => setTab(next) }}>
      {children}
      <CaptureSheet
        projects={projects}
        today={today}
        tab={tab}
        onTabChange={setTab}
        onClose={() => setTab(null)}
      />
    </CaptureContext.Provider>
  );
}

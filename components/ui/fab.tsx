'use client';

import { PlusIcon } from './icons';

/**
 * Punto único de captura en móvil. `bottom-24` lo deja por encima de la barra
 * inferior; en escritorio no se pinta —ahí el acceso es el botón "Añadir" de la
 * barra lateral.
 */
export function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="bg-brand-gradient fixed bottom-24 right-5 z-30 grid size-14 place-items-center rounded-xl text-white shadow-glow transition-transform active:scale-95 lg:hidden"
    >
      <PlusIcon className="size-7" />
    </button>
  );
}

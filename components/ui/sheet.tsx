'use client';

import { useEffect, useRef } from 'react';
import { CloseIcon } from './icons';
import { IconButton } from './icon-button';

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // `showModal()` ya hace su propio barrido de foco: busca un descendiente
      // con el atributo nativo `autofocus` y, si no hay ninguno, cae en el
      // primer elemento enfocable (aquí, el botón "Cerrar"). La prop `autoFocus`
      // de React no sirve para dirigirlo porque intenta enfocar el campo antes
      // de que el diálogo esté abierto. Para que un consumidor dirija el foco
      // inicial, marca el campo con `data-autofocus` y lo enfocamos a mano justo
      // después de abrir — sin reimplementar la trampa de foco, que la sigue
      // dando `showModal()`.
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Clic en el backdrop: el target es el propio <dialog>, no su contenido.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      aria-label={title}
      className="sheet rounded-t-xl border border-border bg-surface-elevated p-0 text-text shadow-lift sm:rounded-xl"
    >
      <div className="flex max-h-[90dvh] flex-col overflow-y-auto p-5 pb-8 sm:pb-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-heading text-text">{title}</h2>
          <IconButton label="Cerrar" tone="ghost" onClick={onClose}>
            <CloseIcon className="size-5" />
          </IconButton>
        </div>
        {children}
      </div>
    </dialog>
  );
}

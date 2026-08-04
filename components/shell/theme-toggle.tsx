'use client';

import { useSyncExternalStore } from 'react';
import { applyTheme, THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

/**
 * El tema vive en la clase `dark` del `<html>`, fuera del árbol de React (la
 * escribe el script inline antes de la primera pintura). Leerlo con
 * `useState` + `useEffect` dispara un `setState` síncrono dentro del efecto,
 * que `react-hooks/set-state-in-effect` prohíbe por encadenar renders.
 * `useSyncExternalStore` es la forma correcta de sincronizar con un sistema
 * externo: un `MutationObserver` avisa cuando `applyTheme` cambia la clase y
 * React se re-renderiza solo, sin `setState` manual.
 */
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => mo.disconnect();
};

const getSnapshot = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

// El servidor no tiene DOM: arranca en claro, igual que antes, y el script
// inline ya corrigió el <html> antes de que React hidrate.
const getServerSnapshot = (): Theme => 'light';

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Modo privado sin almacenamiento: el tema vale para esta sesión y ya.
    }
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggle}
      className="flex w-full items-center justify-between rounded-md border border-border bg-surface-elevated px-4 py-3 text-left transition-colors hover:border-accent/40"
    >
      <span className="flex flex-col">
        <span className="text-label text-text">Tema oscuro</span>
        <span className="text-caption text-text-muted">
          {isDark ? 'Activado' : 'Desactivado'}
        </span>
      </span>
      <span
        aria-hidden
        className={`relative h-7 w-12 shrink-0 rounded-xl transition-colors ${
          isDark ? 'bg-accent' : 'bg-surface-sunken'
        }`}
      >
        <span
          className={`absolute top-1 size-5 rounded-xl bg-surface-elevated shadow-soft transition-all ${
            isDark ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  );
}

/**
 * El tema es preferencia de dispositivo, no de cuenta: no toca `profiles`.
 * Quien use la PWA en el móvil de noche y en el portátil de día quiere valores
 * distintos, y una columna en la base se lo impediría.
 */
export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'avanza-theme';

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

/** Sólo tiene sentido en el navegador; el script inline hace lo mismo antes de
 *  la primera pintura para que no haya parpadeo. */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
}

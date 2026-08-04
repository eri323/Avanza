import { THEME_STORAGE_KEY } from '@/lib/theme';

/**
 * Corre antes de la primera pintura, por eso no puede ser un efecto de React:
 * para cuando un `useEffect` se ejecuta el usuario ya vio el fondo blanco.
 *
 * La lógica está duplicada a propósito con `resolveTheme`: aquí no se puede
 * importar nada, el script se serializa como texto. Los tests de `resolveTheme`
 * cubren la regla; esto es su transcripción mínima.
 */
const SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}

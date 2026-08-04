# 01 — Fundamentos visuales (Tareas 1–3)

← [README](README.md) · → [02 — Primitivas UI](02-primitivas-ui.md)

**Entrega de este archivo:** al terminar, la app sigue teniendo la maquetación
vieja pero ya usa Bricolage Grotesque, los colores de Pulso y responde al
interruptor de tema sin parpadear al recargar.

Lee las **Restricciones globales** del [README](README.md#restricciones-globales)
antes de empezar. Aplican a todas las tareas de este archivo.

---

## Tarea 1: Tokens de Pulso y limpieza del scaffold

**Archivos:**
- Modificar: `app/globals.css` (reemplazo completo, 27 líneas)

**Interfaces:**
- Produce: clases utilitarias de Tailwind derivadas de los tokens —
  `bg-surface`, `bg-surface-elevated`, `bg-surface-sunken`,
  `bg-surface-feature`, `border-border`, `text-text`, `text-text-soft`,
  `text-text-muted`, `text-on-feature`, `text-on-feature-soft`, `bg-accent`,
  `text-accent`, `bg-accent-warm`, `bg-accent-amber`, `bg-positive`,
  `text-positive`; radios `rounded-xs|sm|md|lg|xl` = 8/13/18/22/30px; sombras
  `shadow-soft`, `shadow-lift`, `shadow-glow`; la utilidad `bg-brand-gradient`.
  Todo lo que se escriba a partir de aquí usa estos nombres y **ningún color
  literal**.

- [ ] **Paso 1: Reemplazar `app/globals.css` entero**

Se borra todo lo heredado del scaffold: los tokens Geist que ningún componente
usa, `font-family: Arial` y el bloque `prefers-color-scheme` que competiría con
el sistema de tema nuevo.

```css
@import "tailwindcss";

/* El tema oscuro se decide por clase en <html>, no por prefers-color-scheme:
   el usuario puede forzarlo desde /perfil y su elección gana sobre el sistema. */
@custom-variant dark (&:where(.dark, .dark *));

:root {
  color-scheme: light;

  --pulso-surface: #FBF7FF;
  --pulso-surface-elevated: #FFFFFF;
  --pulso-surface-sunken: #F0E9FA;
  --pulso-surface-feature: #150C28;
  --pulso-border: #F0E9FA;
  --pulso-text: #1B1130;
  --pulso-text-soft: #5B3E8C;
  /* El spec pide #8B7FA8 en ambos temas. Sobre #FBF7FF eso da 3.5:1, por
     debajo de AA. #766A92 da 4.7:1 y es la única desviación de la tabla. */
  --pulso-text-muted: #766A92;

  /* Texto sobre surface-feature. La tarjeta destacada es oscura en los dos
     temas, así que estos dos valores no cambian. */
  --pulso-on-feature: #FFFFFF;
  --pulso-on-feature-soft: #B9A9E0;
}

.dark {
  color-scheme: dark;

  --pulso-surface: #150C28;
  --pulso-surface-elevated: #221542;
  --pulso-surface-sunken: #2C1E4A;
  /* En claro la tarjeta destaca por ser oscura sobre lavanda; en oscuro se
     fundiría con el fondo, así que sube por elevación en vez de por inversión. */
  --pulso-surface-feature: #221542;
  --pulso-border: #3A2560;
  --pulso-text: #FFFFFF;
  --pulso-text-soft: #B9A9E0;
  --pulso-text-muted: #8B7FA8;
}

/* `inline` hace que las utilidades apunten a la variable y no a su valor
   resuelto: es lo que permite que .dark cambie el color sin regenerar CSS. */
@theme inline {
  --color-surface: var(--pulso-surface);
  --color-surface-elevated: var(--pulso-surface-elevated);
  --color-surface-sunken: var(--pulso-surface-sunken);
  --color-surface-feature: var(--pulso-surface-feature);
  --color-border: var(--pulso-border);
  --color-text: var(--pulso-text);
  --color-text-soft: var(--pulso-text-soft);
  --color-text-muted: var(--pulso-text-muted);
  --color-on-feature: var(--pulso-on-feature);
  --color-on-feature-soft: var(--pulso-on-feature-soft);

  /* Acentos idénticos en ambos temas. */
  --color-accent: #8B5CF6;
  --color-accent-warm: #FF5E7E;
  --color-accent-amber: #FF9C5B;
  --color-positive: #67E8A0;

  --radius-xs: 0.5rem;
  --radius-sm: 0.8125rem;
  --radius-md: 1.125rem;
  --radius-lg: 1.375rem;
  --radius-xl: 1.875rem;

  /* Teñidas de violeta, nunca negras: es lo que separa a Pulso de un tema por
     defecto. */
  --shadow-soft: 0 1px 2px rgb(27 17 48 / 0.04), 0 8px 24px -12px rgb(139 92 246 / 0.25);
  --shadow-lift: 0 2px 4px rgb(27 17 48 / 0.06), 0 18px 40px -16px rgb(139 92 246 / 0.35);
  --shadow-glow: 0 10px 30px -8px rgb(139 92 246 / 0.45);
}

@utility bg-brand-gradient {
  background-image: linear-gradient(135deg, #8B5CF6 0%, #FF5E7E 100%);
}

body {
  background-color: var(--pulso-surface);
  color: var(--pulso-text);
  -webkit-tap-highlight-color: transparent;
}
```

- [ ] **Paso 2: Comprobar que compila y que los tokens existen**

```powershell
npm run build
```

Esperado: build exitoso. Un token mal escrito en `@theme` no rompe el build
—Tailwind ignora lo que no entiende—, así que el paso siguiente lo verifica de
verdad.

- [ ] **Paso 3: Verificar visualmente los dos temas**

```powershell
npm run dev
```

Abre `http://localhost:3000/hoy`. Con las DevTools, en la consola:

```js
document.documentElement.classList.add('dark');
```

Esperado: el `body` pasa de `#FBF7FF` a `#150C28` y el texto de `#1B1130` a
`#FFFFFF`. Quítala con `.remove('dark')` y vuelve al claro. Si no cambia, la
directiva `@custom-variant` o el `@theme inline` están mal.

La maquetación sigue fea: eso es correcto en esta tarea.

- [ ] **Paso 4: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `app/globals.css`

Mensaje sugerido: `feat(pulso): tokens semánticos y limpieza del scaffold`

---

## Tarea 2: Bricolage Grotesque y escala tipográfica

**Archivos:**
- Modificar: `app/globals.css` (añade `--font-sans` y la escala `--text-*`)
- Modificar: `app/layout.tsx`

**Interfaces:**
- Consumes: los tokens de la Tarea 1.
- Produce: clases `text-display`, `text-title`, `text-heading`, `text-body`,
  `text-label`, `text-caption`, cada una con su interlineado y su peso ya
  incorporados. A partir de aquí **no se escribe `text-sm font-semibold`
  suelto**: se usa un escalón de la escala.

- [ ] **Paso 1: Añadir la fuente y la escala al bloque `@theme inline`**

En `app/globals.css`, dentro de `@theme inline`, justo después de la línea
`--color-positive: #67E8A0;`, inserta:

```css
  --font-sans: var(--font-bricolage), ui-sans-serif, system-ui, sans-serif;

  /* La escala del prototipo, codificada una vez. Cada escalón lleva su
     interlineado y su peso para que no se repitan inline en cada elemento. */
  --text-display: 2.125rem;
  --text-display--line-height: 1.05;
  --text-display--letter-spacing: -0.03em;
  --text-display--font-weight: 800;

  --text-title: 1.5rem;
  --text-title--line-height: 1.15;
  --text-title--letter-spacing: -0.02em;
  --text-title--font-weight: 700;

  --text-heading: 1.125rem;
  --text-heading--line-height: 1.3;
  --text-heading--letter-spacing: -0.01em;
  --text-heading--font-weight: 600;

  --text-body: 0.9375rem;
  --text-body--line-height: 1.5;
  --text-body--font-weight: 400;

  --text-label: 0.8125rem;
  --text-label--line-height: 1.4;
  --text-label--font-weight: 500;

  --text-caption: 0.6875rem;
  --text-caption--line-height: 1.4;
  --text-caption--letter-spacing: 0.04em;
  --text-caption--font-weight: 600;
```

- [ ] **Paso 2: Cargar la fuente en `app/layout.tsx`**

Reemplaza el archivo entero:

```tsx
import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { Nav } from './nav';
import { ServiceWorkerRegistration } from './service-worker-registration';
import './globals.css';

// Variable: un solo archivo cubre 400–800 sin pedir seis pesos al CDN.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
});

export const metadata: Metadata = {
  title: 'Avanza',
  description: 'Tus tareas y hábitos en un solo lugar.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF7FF' },
    { media: '(prefers-color-scheme: dark)', color: '#150C28' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={bricolage.variable}>
      <body className="min-h-dvh bg-surface font-sans text-body text-text antialiased">
        <Nav />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Paso 3: Verificar que la fuente carga y la escala existe**

```powershell
npm run dev
```

En `http://localhost:3000/hoy`, con DevTools sobre el `<body>`:

```js
getComputedStyle(document.body).fontFamily
```

Esperado: la cadena empieza por un nombre generado por `next/font` que contiene
`Bricolage`. Si dice `ui-sans-serif` a secas, la variable no llegó al `<html>`.

Luego, en la consola:

```js
document.body.insertAdjacentHTML('afterbegin', '<p class="text-display">Avanza</p>');
```

Esperado: aparece "Avanza" en 34px, peso 800, muy apretado de interletra.

- [ ] **Paso 4: Comprobar tipos y build**

```powershell
npm run typecheck; if ($?) { npm run build }
```

Esperado: ambos sin errores.

- [ ] **Paso 5: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `app/globals.css`
- `app/layout.tsx`

Mensaje sugerido: `feat(pulso): Bricolage Grotesque y escala tipográfica`

---

## Tarea 3: Tema claro y oscuro persistente

**Archivos:**
- Crear: `lib/theme.ts`
- Crear: `lib/__tests__/theme.test.ts`
- Crear: `app/theme-script.tsx`
- Crear: `components/shell/theme-toggle.tsx`
- Modificar: `app/layout.tsx` (montar el script en `<head>`)

**Interfaces:**
- Consumes: la clase `.dark` de la Tarea 1.
- Produce:
  - `type Theme = 'light' | 'dark'`
  - `THEME_STORAGE_KEY: 'avanza-theme'`
  - `resolveTheme(stored: string | null, prefersDark: boolean): Theme`
  - `applyTheme(theme: Theme): void` — escribe la clase y `color-scheme` en
    `document.documentElement`.
  - `<ThemeScript />` — server component, script inline para el `<head>`.
  - `<ThemeToggle />` — client component, consumido por `/perfil` en la Tarea 28.

- [ ] **Paso 1: Escribir el test que falla**

`lib/__tests__/theme.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { resolveTheme } from '@/lib/theme';

describe('resolveTheme', () => {
  it('respeta lo guardado por encima de la preferencia del sistema', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('cae en la preferencia del sistema cuando no hay nada guardado', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });

  it('trata un valor corrupto como si no hubiera nada guardado', () => {
    expect(resolveTheme('violeta', true)).toBe('dark');
    expect(resolveTheme('', false)).toBe('light');
  });
});
```

- [ ] **Paso 2: Correr el test y comprobar que falla**

```powershell
npx vitest run lib/__tests__/theme.test.ts
```

Esperado: FAIL — `Failed to resolve import "@/lib/theme"`.

- [ ] **Paso 3: Escribir `lib/theme.ts`**

```ts
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
```

- [ ] **Paso 4: Correr el test y comprobar que pasa**

```powershell
npx vitest run lib/__tests__/theme.test.ts
```

Esperado: PASS, 3 tests.

- [ ] **Paso 5: Escribir el script inline anti-parpadeo**

`app/theme-script.tsx`:

```tsx
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
```

- [ ] **Paso 6: Montar el script en `app/layout.tsx`**

Añade el import junto a los demás:

```tsx
import { ThemeScript } from './theme-script';
```

Y sustituye la apertura del `<html>` para que quede así:

```tsx
    <html lang="es" className={bricolage.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-surface font-sans text-body text-text antialiased">
```

`suppressHydrationWarning` es necesario y acotado: el script cambia el
`class` del `<html>` antes de que React hidrate, y sin él React avisaría de una
diferencia que es exactamente lo que queremos.

- [ ] **Paso 7: Escribir el interruptor**

`components/shell/theme-toggle.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { applyTheme, resolveTheme, THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

/**
 * Arranca en 'light' y se corrige en el efecto. No se lee `localStorage` en el
 * render inicial porque el servidor no lo tiene y la marca no coincidiría.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
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
```

`resolveTheme` no se importa aquí a propósito: el script inline ya resolvió el
valor y el DOM es la fuente de verdad. Se importa igualmente para que el módulo
quede tipado con `Theme`; si el linter marca `resolveTheme` como no usado,
quítalo del import y deja `applyTheme`, `THEME_STORAGE_KEY` y `Theme`.

- [ ] **Paso 8: Verificar la persistencia a mano**

```powershell
npm run dev
```

En `http://localhost:3000/hoy`, en la consola:

```js
localStorage.setItem('avanza-theme', 'dark'); location.reload();
```

Esperado: la página **carga ya oscura**, sin destello blanco. Repite con
`'light'`. Después:

```js
localStorage.removeItem('avanza-theme'); location.reload();
```

Esperado: sigue la preferencia del sistema operativo.

- [ ] **Paso 9: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde. El interruptor todavía no está montado en ninguna
pantalla —lo monta `/perfil` en la Tarea 28—; su import sin usar no rompe nada
porque el archivo se exporta pero no se importa.

- [ ] **Paso 10: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `lib/theme.ts` (nuevo)
- `lib/__tests__/theme.test.ts` (nuevo)
- `app/theme-script.tsx` (nuevo)
- `components/shell/theme-toggle.tsx` (nuevo)
- `app/layout.tsx`

Mensaje sugerido: `feat(pulso): tema claro/oscuro persistente sin parpadeo`

---

→ Continúa en [02 — Primitivas UI](02-primitivas-ui.md)

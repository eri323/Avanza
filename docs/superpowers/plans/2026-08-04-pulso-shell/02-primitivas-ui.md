# 02 — Primitivas UI (Tareas 4–9)

← [01 — Fundamentos visuales](01-fundamentos-visuales.md) · → [03 — Datos derivados](03-datos-derivados.md)

**Entrega de este archivo:** las nueve primitivas de `components/ui/`. Ninguna
importa nada de `features/`, ninguna sabe qué es un hábito y todas reciben los
datos ya calculados. Es la condición del criterio de éxito 5.

Lee las **Restricciones globales** del [README](README.md#restricciones-globales).

**Cómo se verifican estas tareas.** No hay tests unitarios de componentes:
Vitest corre en `environment: 'node'` y el proyecto no tiene
`@testing-library/react`. Añadirlo sería una dependencia que el spec no pide.
Las primitivas se verifican con `typecheck` + `lint` + `build` y con una página
de inspección temporal que se monta y se borra dentro de la misma tarea. La
lógica pura que alimenta a `HeatGrid` sí tiene tests: vive en `features/` y se
escribe en la [Tarea 13](03-datos-derivados.md).

---

## Tarea 4: Iconos

**Archivos:**
- Crear: `components/ui/icons.tsx`
- Crear: `components/ui/index.ts`

**Interfaces:**
- Produce: `type IconProps = React.SVGProps<SVGSVGElement>` y los componentes
  `HomeIcon`, `TasksIcon`, `HabitsIcon`, `ProgressIcon`, `ProfileIcon`,
  `PlusIcon`, `CheckIcon`, `ChevronLeftIcon`, `ChevronRightIcon`, `CloseIcon`,
  `SunIcon`, `MoonIcon`, `FolderIcon`, `CalendarIcon`, `TrashIcon`,
  `AlertIcon`, `SparkIcon`, `FlagIcon`, `PencilIcon`. Todos aceptan `className`
  y por defecto miden `size-6`.

**Por qué a mano y no una librería:** el spec prohíbe traer dependencias de UI.
Diecinueve iconos de trazo son ~95 líneas y evitan 300 kB de árbol que sacudir.

- [ ] **Paso 1: Escribir `components/ui/icons.tsx`**

```tsx
export type IconProps = React.SVGProps<SVGSVGElement>;

/** Trazo uniforme y `currentColor` en todos: el color lo decide quien lo usa. */
function Icon({ children, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={className ?? 'size-6'}
      {...props}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 10.5 12 3.5l8.5 7" />
    <path d="M5.75 9.5V20h12.5V9.5" />
    <path d="M10 20v-5h4v5" />
  </Icon>
);

export const TasksIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <path d="m8.5 12.25 2.5 2.5 4.5-5" />
  </Icon>
);

export const HabitsIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 21a6 6 0 0 0 6-6c0-4-3.5-6.8-6-12-2.5 5.2-6 8-6 12a6 6 0 0 0 6 6Z" />
    <path d="M12 21a2.75 2.75 0 0 0 2.75-2.75c0-1.8-1.6-3-2.75-5-1.15 2-2.75 3.2-2.75 5A2.75 2.75 0 0 0 12 21Z" />
  </Icon>
);

export const ProgressIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5 20v-7" />
    <path d="M12 20V4" />
    <path d="M19 20v-4" />
  </Icon>
);

export const ProfileIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="8.5" r="3.75" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </Icon>
);

export const PlusIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Icon>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m14.5 5-6.5 7 6.5 7" />
  </Icon>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9.5 5 6.5 7-6.5 7" />
  </Icon>
);

export const CloseIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
  </Icon>
);

export const SunIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
  </Icon>
);

export const MoonIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </Icon>
);

export const FolderIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 7.5a2 2 0 0 1 2-2h3.2l1.8 2.2h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
  </Icon>
);

export const CalendarIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="4" />
    <path d="M3.5 10h17M8.5 3.5v3M15.5 3.5v3" />
  </Icon>
);

export const TrashIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 7h15M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="m6.5 7 .8 11.2A2 2 0 0 0 9.3 20h5.4a2 2 0 0 0 2-1.8L17.5 7" />
  </Icon>
);

export const AlertIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 4.5 21 19.5H3Z" />
    <path d="M12 10v4M12 16.8v.2" />
  </Icon>
);

export const SparkIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9L4.5 10.8 10.2 9Z" />
  </Icon>
);

export const FlagIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 21V4" />
    <path d="M6 5h10.5l-1.8 3.5 1.8 3.5H6" />
  </Icon>
);

export const PencilIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.5 19.5h3.2L18.4 8.8a2.25 2.25 0 0 0-3.2-3.2L4.5 16.3Z" />
    <path d="m14.3 6.5 3.2 3.2" />
  </Icon>
);
```

- [ ] **Paso 2: Crear el barril `components/ui/index.ts`**

Se irá ampliando en cada tarea de este archivo.

```ts
export * from './icons';
```

- [ ] **Paso 3: Verificar**

```powershell
npm run typecheck; if ($?) { npm run lint }
```

Esperado: sin errores.

- [ ] **Paso 4: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `components/ui/icons.tsx` (nuevo)
- `components/ui/index.ts` (nuevo)

Mensaje sugerido: `feat(pulso): set de iconos SVG sin dependencias`

---

## Tarea 5: `Card` y `Chip`

**Archivos:**
- Crear: `components/ui/card.tsx`
- Crear: `components/ui/chip.tsx`
- Modificar: `components/ui/index.ts`

**Interfaces:**
- Produce:
  - `<Card tone?: 'plain' | 'feature' | 'sunken' as?: 'div' | 'article' | 'section' className?: string>` — superficie con radio `lg`, borde y sombra `soft`. `tone="feature"` usa `surface-feature` y su texto claro.
  - `<Chip selected?: boolean tone?: 'neutral' | 'accent' dot?: string as?: 'button' | 'span' type?: 'button' …>` — píldora de filtro o de metadato. `dot` pinta un punto de color literal (viene de `projects.color`, que es dato del usuario, no un token). Con `as="button"` hay que pasar `type="button"`: dentro de un `<form>`, un botón sin `type` lo envía.

- [ ] **Paso 1: Escribir `components/ui/card.tsx`**

```tsx
type CardTone = 'plain' | 'feature' | 'sunken';

const TONES: Record<CardTone, string> = {
  plain: 'bg-surface-elevated border-border text-text shadow-soft',
  feature: 'bg-surface-feature border-transparent text-on-feature shadow-lift dark:border-border',
  sunken: 'bg-surface-sunken border-transparent text-text',
};

export function Card({
  tone = 'plain',
  as: Tag = 'div',
  className = '',
  children,
  ...props
}: {
  tone?: CardTone;
  as?: 'div' | 'article' | 'section';
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag className={`rounded-lg border p-5 ${TONES[tone]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
```

- [ ] **Paso 2: Escribir `components/ui/chip.tsx`**

```tsx
type ChipTone = 'neutral' | 'accent';

const SELECTED: Record<ChipTone, string> = {
  neutral: 'bg-text text-surface border-transparent',
  accent: 'bg-accent text-white border-transparent',
};

const IDLE = 'bg-surface-elevated text-text-soft border-border hover:border-accent/40';

export function Chip({
  selected = false,
  tone = 'accent',
  dot,
  as: Tag = 'span',
  type,
  className = '',
  children,
  ...props
}: {
  selected?: boolean;
  tone?: ChipTone;
  /** Color literal del proyecto o del hábito: es dato del usuario, no un token. */
  dot?: string;
  as?: 'button' | 'span';
  /** Sólo tiene sentido con `as="button"`, y ahí es obligatorio: un <button>
   *  sin type dentro de un <form> envía el formulario. */
  type?: 'button';
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      type={type}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-label transition-colors ${
        selected ? SELECTED[tone] : IDLE
      } ${className}`}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className="size-2 rounded-xl"
          style={{ backgroundColor: dot }}
        />
      )}
      {children}
    </Tag>
  );
}
```

- [ ] **Paso 3: Ampliar el barril**

`components/ui/index.ts`:

```ts
export * from './icons';
export { Card } from './card';
export { Chip } from './chip';
```

- [ ] **Paso 4: Verificar**

```powershell
npm run typecheck; if ($?) { npm run lint }
```

Esperado: sin errores.

- [ ] **Paso 5: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `components/ui/card.tsx` (nuevo)
- `components/ui/chip.tsx` (nuevo)
- `components/ui/index.ts`

Mensaje sugerido: `feat(pulso): primitivas Card y Chip`

---

## Tarea 6: `CheckBox` e `IconButton`

**Archivos:**
- Crear: `components/ui/check-box.tsx`
- Crear: `components/ui/icon-button.tsx`
- Modificar: `components/ui/index.ts`

**Interfaces:**
- Produce:
  - `<CheckBox checked: boolean onToggle: () => void label: string disabled?: boolean color?: string shape?: 'square' | 'circle' />` — botón con `role="checkbox"`. `label` va a `aria-label`; **no** renderiza texto: el título lo pone quien la usa.
  - `<IconButton label: string onClick?: () => void tone?: 'plain' | 'ghost' | 'danger' type?: 'button' | 'submit' disabled?: boolean children: React.ReactNode />`

- [ ] **Paso 1: Escribir `components/ui/check-box.tsx`**

```tsx
/**
 * No es un <input type="checkbox">: el prototipo pide un relleno de color
 * propio del hábito y un check dibujado, y estilar el control nativo hasta ahí
 * es más frágil que un botón con role="checkbox".
 */
export function CheckBox({
  checked,
  onToggle,
  label,
  disabled = false,
  color,
  shape = 'square',
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
  /** Color literal del hábito. Si falta, usa el acento. */
  color?: string;
  shape?: 'square' | 'circle';
}) {
  const fill = color ?? '#8B5CF6';

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={`grid size-6 shrink-0 place-items-center border-2 transition-all disabled:opacity-40 ${
        shape === 'circle' ? 'rounded-xl' : 'rounded-xs'
      }`}
      style={{
        borderColor: fill,
        backgroundColor: checked ? fill : 'transparent',
      }}
    >
      {checked && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="size-4"
        >
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Paso 2: Escribir `components/ui/icon-button.tsx`**

```tsx
type IconButtonTone = 'plain' | 'ghost' | 'danger';

const TONES: Record<IconButtonTone, string> = {
  plain: 'bg-surface-elevated border-border text-text-soft hover:border-accent/40',
  ghost: 'bg-transparent border-transparent text-text-soft hover:bg-surface-sunken',
  danger: 'bg-transparent border-transparent text-accent-warm hover:bg-accent-warm/10',
};

export function IconButton({
  label,
  tone = 'plain',
  type = 'button',
  className = '',
  children,
  ...props
}: {
  label: string;
  tone?: IconButtonTone;
  type?: 'button' | 'submit';
  className?: string;
  children: React.ReactNode;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`grid size-11 shrink-0 place-items-center rounded-md border transition-colors disabled:opacity-40 ${TONES[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

`size-11` son 44px: el mínimo cómodo para un objetivo táctil.

- [ ] **Paso 3: Ampliar el barril**

```ts
export * from './icons';
export { Card } from './card';
export { Chip } from './chip';
export { CheckBox } from './check-box';
export { IconButton } from './icon-button';
```

- [ ] **Paso 4: Verificar**

```powershell
npm run typecheck; if ($?) { npm run lint }
```

Esperado: sin errores.

- [ ] **Paso 5: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `components/ui/check-box.tsx` (nuevo)
- `components/ui/icon-button.tsx` (nuevo)
- `components/ui/index.ts`

Mensaje sugerido: `feat(pulso): primitivas CheckBox e IconButton`

---

## Tarea 7: `ProgressBar` y `StatTile`

**Archivos:**
- Crear: `components/ui/progress-bar.tsx`
- Crear: `components/ui/stat-tile.tsx`
- Modificar: `components/ui/index.ts`

**Interfaces:**
- Produce:
  - `<ProgressBar percent: number label: string tone?: 'gradient' | 'accent' | 'positive' size?: 'sm' | 'md' />` — recibe el porcentaje **ya calculado**; lo único que hace es recortarlo a 0–100.
  - `<StatTile value: string label: string tone?: 'plain' | 'feature' icon?: React.ReactNode />`

- [ ] **Paso 1: Escribir `components/ui/progress-bar.tsx`**

```tsx
const TONES = {
  gradient: 'bg-brand-gradient',
  accent: 'bg-accent',
  positive: 'bg-positive',
} as const;

/**
 * La primitiva no calcula nada: recibe el porcentaje ya derivado (de `lib/xp.ts`
 * o de un conteo) y sólo lo recorta para que un dato raro no desborde la barra.
 */
export function ProgressBar({
  percent,
  label,
  tone = 'gradient',
  size = 'md',
}: {
  percent: number;
  label: string;
  tone?: keyof typeof TONES;
  size?: 'sm' | 'md';
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-xl bg-surface-sunken/60 ${
        size === 'sm' ? 'h-1.5' : 'h-2.5'
      }`}
    >
      <div
        className={`h-full rounded-xl transition-[width] duration-500 ease-out ${TONES[tone]}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
```

- [ ] **Paso 2: Escribir `components/ui/stat-tile.tsx`**

```tsx
export function StatTile({
  value,
  label,
  tone = 'plain',
  icon,
}: {
  value: string;
  label: string;
  tone?: 'plain' | 'feature';
  icon?: React.ReactNode;
}) {
  const feature = tone === 'feature';

  return (
    <div
      className={`flex flex-col gap-1 rounded-md border p-4 ${
        feature
          ? 'border-transparent bg-surface-feature text-on-feature dark:border-border'
          : 'border-border bg-surface-elevated text-text'
      }`}
    >
      {icon && (
        <span className={feature ? 'text-positive' : 'text-accent'}>{icon}</span>
      )}
      <span className="text-title">{value}</span>
      <span
        className={`text-caption uppercase ${
          feature ? 'text-on-feature-soft' : 'text-text-muted'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
```

- [ ] **Paso 3: Ampliar el barril**

Añade a `components/ui/index.ts`:

```ts
export { ProgressBar } from './progress-bar';
export { StatTile } from './stat-tile';
```

- [ ] **Paso 4: Verificar**

```powershell
npm run typecheck; if ($?) { npm run lint }
```

Esperado: sin errores.

- [ ] **Paso 5: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `components/ui/progress-bar.tsx` (nuevo)
- `components/ui/stat-tile.tsx` (nuevo)
- `components/ui/index.ts`

Mensaje sugerido: `feat(pulso): primitivas ProgressBar y StatTile`

---

## Tarea 8: `HeatGrid`

**Archivos:**
- Crear: `components/ui/heat-grid.tsx`
- Modificar: `components/ui/index.ts`

**Interfaces:**
- Produce:
  - `type HeatCell = { key: string; level: 0 | 1 | 2; label: string }` — `0` vacío, `1` cumplido, `2` fuera de rango (futuro).
  - `type HeatColumn = HeatCell[]`
  - `<HeatGrid columns: HeatColumn[] color: string caption: string />`
- **Quién construye las columnas:** `features/habits/heatmap.ts`, en la
  [Tarea 13](03-datos-derivados.md), con tests. `HeatGrid` no sabe qué es un
  hábito ni cómo se calcula una racha: pinta intensidades.

- [ ] **Paso 1: Escribir `components/ui/heat-grid.tsx`**

```tsx
export type HeatCell = {
  key: string;
  /** 0 vacío · 1 cumplido · 2 fuera de rango (futuro) */
  level: 0 | 1 | 2;
  label: string;
};

export type HeatColumn = HeatCell[];

/**
 * Pinta una rejilla de intensidades. No conoce el dominio: quien la usa le pasa
 * las columnas ya construidas por una función pura con tests. Es lo que permite
 * que los bloques 2 a 5 la reutilicen sin tocarla.
 */
export function HeatGrid({
  columns,
  color,
  caption,
}: {
  columns: HeatColumn[];
  /** Color literal del hábito. */
  color: string;
  caption: string;
}) {
  return (
    <div className="flex gap-1" role="group" aria-label={caption}>
      {columns.map((column, index) => (
        <div key={index} className="flex flex-col gap-1">
          {column.map((cell) => (
            <span
              key={cell.key}
              title={cell.label}
              className="size-3 rounded-[3px] bg-surface-sunken"
              style={
                cell.level === 1
                  ? { backgroundColor: color }
                  : cell.level === 2
                    ? { opacity: 0.35 }
                    : undefined
              }
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Paso 2: Ampliar el barril**

Añade a `components/ui/index.ts`:

```ts
export { HeatGrid, type HeatCell, type HeatColumn } from './heat-grid';
```

- [ ] **Paso 3: Verificar**

```powershell
npm run typecheck; if ($?) { npm run lint }
```

Esperado: sin errores.

- [ ] **Paso 4: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `components/ui/heat-grid.tsx` (nuevo)
- `components/ui/index.ts`

Mensaje sugerido: `feat(pulso): primitiva HeatGrid`

---

## Tarea 9: `Sheet` y `Fab`

**Archivos:**
- Crear: `components/ui/sheet.tsx`
- Crear: `components/ui/fab.tsx`
- Modificar: `components/ui/index.ts`
- Modificar: `app/globals.css` (clases `.sheet` y `.sheet::backdrop`)

**Interfaces:**
- Produce:
  - `<Sheet open: boolean onClose: () => void title: string children: React.ReactNode />` — hoja inferior en móvil, diálogo centrado desde 640px. **Un solo componente con otra posición**, como pide el spec.
  - `<Fab label: string onClick: () => void />` — botón circular con gradiente de marca, fijo sobre la barra inferior.

**Por qué `<dialog>` nativo:** trae trampa de foco, cierre con `Esc` y `inert`
sobre el fondo sin una línea de JavaScript. Reimplementar eso a mano es la
fuente habitual de hojas que atrapan el foco detrás.

- [ ] **Paso 1: Añadir las clases de posición a `app/globals.css`**

Al final del archivo, después del bloque `body { … }`:

```css
/* La posición del diálogo modal la calcula el navegador con `inset: 0` +
   `margin: auto`. Sobrescribir el margen es la forma limpia de anclarlo abajo
   en móvil y centrarlo en escritorio, sin duplicar el componente. */
.sheet {
  margin: auto auto 0;
  width: 100%;
  max-width: 100%;
  max-height: 90dvh;
}

.sheet::backdrop {
  background-color: rgb(21 12 40 / 0.55);
  backdrop-filter: blur(2px);
}

@media (min-width: 640px) {
  .sheet {
    margin: auto;
    width: 28rem;
    max-width: calc(100% - 2rem);
  }
}
```

- [ ] **Paso 2: Escribir `components/ui/sheet.tsx`**

```tsx
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

    if (open && !dialog.open) dialog.showModal();
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
```

- [ ] **Paso 3: Escribir `components/ui/fab.tsx`**

```tsx
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
```

- [ ] **Paso 4: Ampliar el barril**

Añade a `components/ui/index.ts`:

```ts
export { Sheet } from './sheet';
export { Fab } from './fab';
```

El barril queda así, completo:

```ts
export * from './icons';
export { Card } from './card';
export { Chip } from './chip';
export { CheckBox } from './check-box';
export { IconButton } from './icon-button';
export { ProgressBar } from './progress-bar';
export { StatTile } from './stat-tile';
export { HeatGrid, type HeatCell, type HeatColumn } from './heat-grid';
export { Sheet } from './sheet';
export { Fab } from './fab';
```

- [ ] **Paso 5: Inspección visual con una página temporal**

Crea `app/_pulso/page.tsx` — el prefijo `_` la deja fuera del enrutado, así que
se accede sólo importándola; para verla, créala como `app/pulso/page.tsx`,
míralas y **bórrala en el paso 7**.

`app/pulso/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import {
  Card,
  CheckBox,
  Chip,
  Fab,
  HeatGrid,
  IconButton,
  ProgressBar,
  Sheet,
  StatTile,
  TrashIcon,
  HabitsIcon,
} from '@/components/ui';

export default function PulsoPreview() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  const columns = Array.from({ length: 5 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => ({
      key: `${week}-${day}`,
      level: ((week + day) % 3) as 0 | 1 | 2,
      label: `celda ${week}-${day}`,
    })),
  );

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <Card>
        <p className="text-heading">Card plain</p>
        <p className="text-body text-text-soft">Texto suave</p>
        <p className="text-caption uppercase text-text-muted">Texto apagado</p>
      </Card>

      <Card tone="feature">
        <p className="text-title">Card feature</p>
        <p className="text-body text-on-feature-soft">Sobre superficie oscura</p>
        <p className="text-label text-positive">+240 XP</p>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Chip as="button" type="button" selected>Todos</Chip>
        <Chip as="button" type="button" dot="#FF9C5B">Casa</Chip>
        <Chip as="button" type="button" tone="neutral" selected>Neutral</Chip>
      </div>

      <div className="flex items-center gap-3">
        <CheckBox checked={done} onToggle={() => setDone(!done)} label="Probar" />
        <CheckBox checked shape="circle" color="#67E8A0" onToggle={() => {}} label="Circular" />
        <IconButton label="Borrar" tone="danger">
          <TrashIcon className="size-5" />
        </IconButton>
      </div>

      <ProgressBar percent={62} label="Progreso de ejemplo" />
      <ProgressBar percent={140} label="Recortado a 100" tone="accent" size="sm" />

      <div className="grid grid-cols-2 gap-3">
        <StatTile value="12" label="Racha" icon={<HabitsIcon className="size-5" />} />
        <StatTile value="84%" label="Del mes" tone="feature" />
      </div>

      <Card>
        <HeatGrid columns={columns} color="#8B5CF6" caption="Cinco semanas" />
      </Card>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-brand-gradient rounded-md px-4 py-3 text-label text-white"
      >
        Abrir hoja
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Hoja de prueba">
        <p className="text-body text-text-soft">
          En móvil sube desde abajo; desde 640px se centra.
        </p>
      </Sheet>

      <Fab label="Añadir" onClick={() => setOpen(true)} />
    </main>
  );
}
```

- [ ] **Paso 6: Mirarla en los dos anchos y los dos temas**

```powershell
npm run dev
```

En `http://localhost:3000/pulso` comprueba:

1. A 390px de ancho: la hoja sube desde abajo y ocupa todo el ancho; el FAB está
   abajo a la derecha con gradiente violeta→rosa.
2. A 1280px: la hoja se centra en 448px y el FAB desaparece.
3. `Esc` cierra la hoja. Un clic fuera del recuadro también.
4. Con `document.documentElement.classList.toggle('dark')`: las tarjetas
   cambian de fondo, la `feature` sube a `#221542` y el texto sigue legible.
5. La segunda `ProgressBar` está llena del todo, no desbordada.

- [ ] **Paso 7: Borrar la página de inspección**

```powershell
Remove-Item -Recurse -Force app\pulso
```

Esperado: `app/pulso/` ya no existe. **No se commitea**; existió sólo para
mirar las primitivas.

- [ ] **Paso 8: Batería completa**

```powershell
npm run typecheck; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 9: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `components/ui/sheet.tsx` (nuevo)
- `components/ui/fab.tsx` (nuevo)
- `components/ui/index.ts`
- `app/globals.css`

Mensaje sugerido: `feat(pulso): primitivas Sheet y Fab`

---

→ Continúa en [03 — Datos derivados](03-datos-derivados.md)

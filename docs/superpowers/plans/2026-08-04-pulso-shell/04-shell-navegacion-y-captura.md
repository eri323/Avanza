# 04 — Shell, navegación y captura (Tareas 17–19)

← [03 — Datos derivados](03-datos-derivados.md) · → [05 — Pantalla Inicio](05-pantalla-inicio.md)

**Entrega de este archivo:** las rutas definitivas con sus redirecciones, el
layout responsive decidido por CSS y el punto único de captura. Al terminar,
Avanza **se navega** como el prototipo aunque el contenido de cada pantalla siga
siendo el viejo.

Lee las **Restricciones globales** del [README](README.md#restricciones-globales).

---

## Tarea 17: Rutas nuevas y redirecciones

**Archivos:**
- Mover: `app/hoy/` → `app/(app)/inicio/`
- Mover: `app/ajustes/` → `app/(app)/perfil/`
- Mover: `app/tareas/`, `app/habitos/`, `app/proyectos/` → bajo `app/(app)/`
- Modificar: `next.config.ts`
- Modificar: `proxy.ts`
- Modificar: `app/page.tsx`
- Modificar: `app/manifest.ts`
- Modificar: `public/sw.js`
- Modificar: `app/login/page.tsx` (sólo los `router.push`)
- Modificar: `features/tasks/actions.ts`, `features/habits/actions.ts`
- Modificar: `e2e/auth.setup.ts`

**Interfaces:**
- Produce: las rutas `/inicio`, `/tareas`, `/habitos`, `/progreso`, `/perfil`,
  `/proyectos`, todas bajo el grupo `(app)` — que en la Tarea 18 recibirá el
  shell. `/login` y `/auth` quedan fuera del grupo: no llevan navegación.
- `/hoy` y `/ajustes` sobreviven como redirecciones permanentes.

**Por qué el grupo `(app)`:** el shell tiene que envolver a seis pantallas y a
ninguna más. Un grupo de rutas da exactamente eso con un `layout.tsx`, sin
condicionales por `pathname` en el layout raíz y sin que `/login` herede una
barra de navegación que no debe ver quien no ha entrado.

**`/hoy` y `/ajustes` no se borran:** la PWA ya instalada apunta a `/hoy` y un
404 al abrirla sería el peor estreno posible del rediseño.

- [ ] **Paso 1: Mover las carpetas**

```powershell
New-Item -ItemType Directory -Force "app/(app)"
Move-Item "app/hoy" "app/(app)/inicio"
Move-Item "app/ajustes" "app/(app)/perfil"
Move-Item "app/tareas" "app/(app)/tareas"
Move-Item "app/habitos" "app/(app)/habitos"
Move-Item "app/proyectos" "app/(app)/proyectos"
Get-ChildItem "app" -Name
```

Esperado en la última salida: `(app)`, `auth`, `favicon.ico`, `globals.css`,
`layout.tsx`, `login`, `manifest.ts`, `nav.tsx`, `page.tsx`,
`service-worker-registration.tsx`, `theme-script.tsx`.

- [ ] **Paso 2: Renombrar el componente y el encabezado de Inicio**

`app/(app)/inicio/page.tsx` — cambia sólo dos cosas; el resto se reescribe en la
Tarea 21.

```tsx
export default async function InicioPage() {
```

y el `<h1>`:

```tsx
        <h1 className="text-xl font-semibold">Inicio</h1>
```

`app/(app)/perfil/page.tsx` — igual:

```tsx
export default async function PerfilPage() {
```

```tsx
      <h1 className="text-xl font-semibold">Perfil</h1>
```

- [ ] **Paso 3: Declarar las redirecciones permanentes**

`next.config.ts` — reemplaza el archivo:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * `/hoy` y `/ajustes` fueron las rutas de la v1 y la PWA instalada apunta a
   * la primera. Permanentes y no temporales: son un cambio de nombre definitivo,
   * y un 308 deja que el navegador deje de pedirlas.
   */
  async redirects() {
    return [
      { source: '/hoy', destination: '/inicio', permanent: true },
      { source: '/ajustes', destination: '/perfil', permanent: true },
    ];
  },
};

export default nextConfig;
```

- [ ] **Paso 4: Actualizar los destinos del proxy**

`proxy.ts` — en el bloque que redirige a quien ya tiene sesión fuera de
`/login`, cambia `/hoy` por `/inicio`:

```ts
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/inicio';
    return NextResponse.redirect(url);
  }
```

- [ ] **Paso 5: Actualizar la raíz, el manifiesto y el service worker**

`app/page.tsx`:

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/inicio');
}
```

`app/manifest.ts` — reemplaza el archivo:

```ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Avanza',
    short_name: 'Avanza',
    description: 'Tus tareas y hábitos en un solo lugar.',
    start_url: '/inicio',
    display: 'standalone',
    background_color: '#FBF7FF',
    theme_color: '#FBF7FF',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

`public/sw.js` — dos cambios. La versión de la caché sube para que el
`activate` borre las páginas guardadas con la piel vieja:

```js
const CACHE = 'avanza-v2';
```

Y el respaldo sin conexión apunta a la ruta nueva:

```js
      .catch(() => caches.match(event.request).then((hit) => hit ?? caches.match('/inicio'))),
```

- [ ] **Paso 6: Actualizar los destinos del login**

`app/login/page.tsx` — en `handleSignIn` y en `handleSignUp`, sustituye
`router.push('/hoy')` por:

```tsx
      router.push('/inicio');
```

(dos apariciones).

- [ ] **Paso 7: Actualizar las revalidaciones**

`features/tasks/actions.ts` — reemplaza `revalidateTaskViews`:

```ts
function revalidateTaskViews() {
  revalidatePath('/inicio');
  revalidatePath('/tareas');
  // El XP y el nivel se derivan de las tareas completadas: si no se revalida,
  // /progreso enseñaría el nivel de antes de marcar.
  revalidatePath('/progreso');
  revalidatePath('/proyectos', 'layout');
}
```

`features/habits/actions.ts` — reemplaza `revalidateHabitViews`:

```ts
function revalidateHabitViews() {
  revalidatePath('/inicio');
  revalidatePath('/habitos', 'layout');
  revalidatePath('/progreso');
}
```

- [ ] **Paso 8: Desbloquear el arranque de Playwright**

`e2e/auth.setup.ts` — la aserción final espera el encabezado "Hoy", que ya no
existe. Sustituye ese bloque por una espera de la URL; los selectores completos
se actualizan en la Tarea 31.

```ts
  await page.waitForURL('**/inicio', { timeout: 15_000 });
```

Y quita `expect` del import si el linter lo marca como no usado.

- [ ] **Paso 9: Verificar las redirecciones a mano**

```powershell
npm run build; if ($?) { npm run dev }
```

Con la app corriendo, comprueba en el navegador:

1. `http://localhost:3000/hoy` → acaba en `/inicio` y la barra de direcciones lo
   refleja.
2. `http://localhost:3000/ajustes` → acaba en `/perfil`.
3. `http://localhost:3000/` → acaba en `/inicio`.
4. `http://localhost:3000/tareas` y `/habitos` cargan.
5. `http://localhost:3000/progreso` da 404. **Es esperado hasta la Tarea 27.**

- [ ] **Paso 10: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }
```

Esperado: todo verde.

- [ ] **Paso 11: Reportar al autor**

**No ejecutes git.** El autor tendrá que hacer `git add -A` para que los
movimientos de carpeta se registren como renombrados. Archivos tocados:

- `app/(app)/inicio/`, `app/(app)/perfil/`, `app/(app)/tareas/`,
  `app/(app)/habitos/`, `app/(app)/proyectos/` (movidos desde `app/`)
- `next.config.ts`
- `proxy.ts`
- `app/page.tsx`
- `app/manifest.ts`
- `public/sw.js`
- `app/login/page.tsx`
- `features/tasks/actions.ts`
- `features/habits/actions.ts`
- `e2e/auth.setup.ts`

Mensaje sugerido: `refactor(pulso): rutas /inicio y /perfil con redirecciones permanentes`

---

## Tarea 18: Shell responsive y captura de tareas

**Archivos:**
- Crear: `components/shell/is-active.ts`
- Crear: `components/shell/__tests__/is-active.test.ts`
- Crear: `components/shell/nav-items.ts`
- Crear: `components/shell/bottom-nav.tsx`
- Crear: `components/shell/sidebar.tsx`
- Crear: `components/shell/capture-provider.tsx`
- Crear: `components/shell/capture-sheet.tsx`
- Crear: `components/shell/capture-launcher.tsx`
- Crear: `components/shell/app-shell.tsx`
- Crear: `app/(app)/layout.tsx`
- Modificar: `app/layout.tsx` (quitar `<Nav />`)
- Borrar: `app/nav.tsx`

**Interfaces:**
- Consumes: `Fab`, `Sheet`, `Chip`, `PlusIcon`, `FolderIcon` y los iconos de
  navegación (Tareas 4–9); `listProjectsWithCounts` (Tarea 15);
  `getTodayForUser` (ya existía); `createTask` (ya existía).
- Produce:
  - `isActive(pathname: string, href: string): boolean`
  - `NAV_ITEMS` — cinco destinos en orden: Inicio, Tareas, Hábitos, Progreso, Perfil.
  - `useCapture(): { open: (tab?: 'task' | 'habit') => void }`
  - `<CaptureProvider projects today>`, `<CaptureSheet>`, `<CaptureLauncher>`,
    `<Sidebar>`, `<BottomNav>`, `<AppShell>`.

**El layout lo decide CSS, no JavaScript.** Ni detección de ancho en el
servidor ni `matchMedia` en el cliente: no hay estado que hidratar y por lo
tanto no hay salto visual al cargar.

**Cinco destinos y no seis.** Proyectos deja de ser de primer nivel: cinco es el
máximo cómodo en una barra inferior. En escritorio la barra lateral los lista
debajo; en móvil son chips de filtro en `/tareas` (Tarea 22).

- [ ] **Paso 1: Escribir el test que falla**

`components/shell/__tests__/is-active.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { isActive } from '../is-active';

describe('isActive', () => {
  it('marca el destino exacto', () => {
    expect(isActive('/tareas', '/tareas')).toBe(true);
  });

  it('marca el destino cuando se está en una subruta', () => {
    expect(isActive('/tareas/8f3c', '/tareas')).toBe(true);
    expect(isActive('/habitos/8f3c', '/habitos')).toBe(true);
  });

  it('no confunde rutas que comparten prefijo de texto', () => {
    expect(isActive('/tareasplus', '/tareas')).toBe(false);
    expect(isActive('/proyectos', '/progreso')).toBe(false);
  });

  it('no marca destinos ajenos', () => {
    expect(isActive('/inicio', '/perfil')).toBe(false);
  });
});
```

- [ ] **Paso 2: Correr el test y comprobar que falla**

```powershell
npx vitest run components/shell/__tests__/is-active.test.ts
```

Esperado: FAIL — no se resuelve `../is-active`.

- [ ] **Paso 3: Escribir `components/shell/is-active.ts`**

Sin importaciones a propósito: es la única lógica con reglas del shell y así se
prueba en Node sin arrastrar componentes.

```ts
/**
 * Un destino está activo en su ruta y en sus subrutas. La barra comparando por
 * `startsWith` a secas marcaría `/progreso` estando en `/proyectos`; la barra
 * es el sitio donde ese error se ve todo el rato.
 */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
```

- [ ] **Paso 4: Correr el test y comprobar que pasa**

```powershell
npx vitest run components/shell/__tests__/is-active.test.ts
```

Esperado: PASS, 4 tests.

- [ ] **Paso 5: Declarar los destinos**

`components/shell/nav-items.ts`:

```ts
import {
  HabitsIcon,
  HomeIcon,
  ProfileIcon,
  ProgressIcon,
  TasksIcon,
} from '@/components/ui';

/** Los cinco destinos, en el orden del prototipo. */
export const NAV_ITEMS = [
  { href: '/inicio', label: 'Inicio', Icon: HomeIcon },
  { href: '/tareas', label: 'Tareas', Icon: TasksIcon },
  { href: '/habitos', label: 'Hábitos', Icon: HabitsIcon },
  { href: '/progreso', label: 'Progreso', Icon: ProgressIcon },
  { href: '/perfil', label: 'Perfil', Icon: ProfileIcon },
] as const;
```

- [ ] **Paso 6: Escribir el proveedor de captura**

`components/shell/capture-provider.tsx`:

```tsx
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
```

- [ ] **Paso 7: Escribir la hoja de captura con la pestaña Tarea**

`components/shell/capture-sheet.tsx`. La pestaña Hábito llega en la Tarea 19;
hasta entonces sólo se pinta la de Tarea.

```tsx
'use client';

import { useState, useTransition } from 'react';
import { Chip, Sheet } from '@/components/ui';
import { addDays, type IsoDate } from '@/lib/dates';
import type { ProjectWithCount } from '@/features/projects';
import { createTask } from '@/features/tasks';
import type { TaskPriority } from '@/features/tasks';
import type { CaptureTab } from './capture-provider';

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'none', label: 'Sin prioridad' },
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
];

export function CaptureSheet({
  projects,
  today,
  tab,
  onTabChange,
  onClose,
}: {
  projects: ProjectWithCount[];
  today: IsoDate;
  tab: CaptureTab | null;
  onTabChange: (tab: CaptureTab) => void;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('none');
  const [dueDate, setDueDate] = useState<IsoDate | null>(today);
  const [projectId, setProjectId] = useState<string | null>(null);

  const tomorrow = addDays(today, 1);

  function resetTask() {
    setTitle('');
    setPriority('none');
    setDueDate(today);
    setProjectId(null);
  }

  function submitTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set('title', title);
    formData.set('priority', priority);
    if (dueDate) formData.set('dueDate', dueDate);
    if (projectId) formData.set('projectId', projectId);

    startTransition(async () => {
      const result = await createTask(formData);
      if (result.ok) {
        resetTask();
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Sheet open={tab !== null} onClose={onClose} title="Añadir">
      <div
        role="tablist"
        aria-label="Qué añadir"
        className="mb-5 flex gap-2 rounded-md bg-surface-sunken p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'task'}
          onClick={() => onTabChange('task')}
          className={`flex-1 rounded-xs py-2 text-label transition-colors ${
            tab === 'task'
              ? 'bg-surface-elevated text-text shadow-soft'
              : 'text-text-soft'
          }`}
        >
          Tarea
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'habit'}
          onClick={() => onTabChange('habit')}
          className={`flex-1 rounded-xs py-2 text-label transition-colors ${
            tab === 'habit'
              ? 'bg-surface-elevated text-text shadow-soft'
              : 'text-text-soft'
          }`}
        >
          Hábito
        </button>
      </div>

      {tab === 'task' && (
        <form onSubmit={submitTask} className="flex flex-col gap-5">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            autoFocus
            placeholder="¿Qué hay que hacer?"
            aria-label="Título de la tarea"
            className="w-full rounded-md border border-border bg-surface px-4 py-3 text-body text-text outline-none placeholder:text-text-muted focus:border-accent"
          />

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-caption uppercase text-text-muted">
              Prioridad
            </legend>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((option) => (
                <Chip
                  key={option.value}
                  as="button"
                  type="button"
                  selected={priority === option.value}
                  onClick={() => setPriority(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-caption uppercase text-text-muted">
              Fecha
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              <Chip as="button" type="button" selected={dueDate === today} onClick={() => setDueDate(today)}>
                Hoy
              </Chip>
              <Chip as="button" type="button" selected={dueDate === tomorrow} onClick={() => setDueDate(tomorrow)}>
                Mañana
              </Chip>
              <Chip as="button" type="button" selected={dueDate === null} onClick={() => setDueDate(null)}>
                Sin fecha
              </Chip>
              <input
                type="date"
                value={dueDate ?? ''}
                onChange={(event) => setDueDate(event.target.value || null)}
                aria-label="Otra fecha"
                className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-label text-text-soft"
              />
            </div>
          </fieldset>

          {projects.length > 0 && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-caption uppercase text-text-muted">
                Proyecto
              </legend>
              <div className="flex flex-wrap gap-2">
                <Chip as="button" type="button" selected={projectId === null} onClick={() => setProjectId(null)}>
                  Sin proyecto
                </Chip>
                {projects.map((project) => (
                  <Chip
                    key={project.id}
                    as="button"
                    type="button"
                    dot={project.color}
                    selected={projectId === project.id}
                    onClick={() => setProjectId(project.id)}
                  >
                    {project.name}
                  </Chip>
                ))}
              </div>
            </fieldset>
          )}

          {error && <p className="text-label text-accent-warm">{error}</p>}

          <button
            type="submit"
            disabled={pending || title.trim() === ''}
            className="bg-brand-gradient w-full rounded-md py-3.5 text-label text-white shadow-glow transition-opacity disabled:opacity-40"
          >
            {pending ? 'Añadiendo…' : 'Añadir tarea'}
          </button>
        </form>
      )}
    </Sheet>
  );
}
```

El chip de hora del prototipo queda fuera a propósito: es del bloque 2.

- [ ] **Paso 8: Escribir el lanzador móvil**

`components/shell/capture-launcher.tsx`:

```tsx
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
```

- [ ] **Paso 9: Escribir la barra inferior**

`components/shell/bottom-nav.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActive } from './is-active';
import { NAV_ITEMS } from './nav-items';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface-elevated/95 backdrop-blur lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                  active ? 'text-accent' : 'text-text-muted'
                }`}
              >
                <Icon className="size-6" />
                <span className="text-[0.6875rem] leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Paso 10: Escribir la barra lateral**

`components/shell/sidebar.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderIcon, PlusIcon } from '@/components/ui';
import type { ProjectWithCount } from '@/features/projects';
import { useCapture } from './capture-provider';
import { isActive } from './is-active';
import { NAV_ITEMS } from './nav-items';

export function Sidebar({ projects }: { projects: ProjectWithCount[] }) {
  const pathname = usePathname();
  const { open } = useCapture();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-6 border-r border-border bg-surface-elevated px-4 py-6 lg:flex">
      <div className="flex flex-col gap-4 px-2">
        <span className="text-title text-text">Avanza</span>
        {/* En escritorio el FAB pasa a ser este botón: mismo componente Sheet,
            otra posición. No hay dos implementaciones de la captura. */}
        <button
          type="button"
          onClick={() => open('task')}
          className="bg-brand-gradient flex items-center justify-center gap-2 rounded-md py-3 text-label text-white shadow-glow transition-transform active:scale-[0.98]"
        >
          <PlusIcon className="size-5" />
          Añadir
        </button>
      </div>

      <nav aria-label="Navegación principal" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-label transition-colors ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-soft hover:bg-surface-sunken'
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        <span className="px-3 text-caption uppercase text-text-muted">
          Proyectos
        </span>
        {projects.length === 0 ? (
          <p className="px-3 text-label text-text-muted">Todavía ninguno.</p>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/proyectos/${project.id}`}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-label text-text-soft transition-colors hover:bg-surface-sunken"
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-xl"
                style={{ backgroundColor: project.color }}
              />
              <span className="min-w-0 flex-1 truncate">{project.name}</span>
              <span className="text-caption text-text-muted">
                {project.pendingCount}
              </span>
            </Link>
          ))
        )}
      </div>

      <Link
        href="/proyectos"
        className="flex items-center gap-3 rounded-md px-3 py-2.5 text-label text-text-soft transition-colors hover:bg-surface-sunken"
      >
        <FolderIcon className="size-5" />
        Gestionar proyectos
      </Link>
    </aside>
  );
}
```

- [ ] **Paso 11: Escribir el shell**

`components/shell/app-shell.tsx`:

```tsx
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
```

Y `components/shell/app-shell-client.tsx`:

```tsx
'use client';

import type { IsoDate } from '@/lib/dates';
import type { ProjectWithCount } from '@/features/projects';
import { BottomNav } from './bottom-nav';
import { CaptureLauncher } from './capture-launcher';
import { CaptureProvider } from './capture-provider';
import { Sidebar } from './sidebar';

/**
 * El layout se decide por CSS: `lg:pl-64` reserva el hueco de la barra lateral
 * y las dos barras se muestran u ocultan con `lg:hidden` / `hidden lg:flex`.
 * Ni `matchMedia` ni detección de ancho en el servidor: no hay estado que
 * hidratar y por eso no hay salto visual al cargar.
 */
export function AppShellClient({
  projects,
  today,
  children,
}: {
  projects: ProjectWithCount[];
  today: IsoDate;
  children: React.ReactNode;
}) {
  return (
    <CaptureProvider projects={projects} today={today}>
      <div className="min-h-dvh bg-surface">
        <Sidebar projects={projects} />
        <div className="lg:pl-64">
          <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-6 lg:px-8 lg:pb-12">
            {children}
          </main>
        </div>
        <CaptureLauncher />
        <BottomNav />
      </div>
    </CaptureProvider>
  );
}
```

`pb-28` deja sitio para la barra inferior y el FAB en móvil; desde `lg` la barra
inferior no existe y el hueco baja a `pb-12`.

- [ ] **Paso 12: Montar el shell en el grupo de rutas**

`app/(app)/layout.tsx`:

```tsx
import { AppShell } from '@/components/shell/app-shell';

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Paso 13: Retirar la navegación vieja**

`app/layout.tsx` — quita el import de `Nav` y su uso; el `<body>` queda así:

```tsx
      <body className="min-h-dvh bg-surface font-sans text-body text-text antialiased">
        <ServiceWorkerRegistration />
        {children}
      </body>
```

Y borra el archivo:

```powershell
Remove-Item app\nav.tsx
```

- [ ] **Paso 14: Verificar en los dos anchos**

```powershell
npm run dev
```

A 390px de ancho, en `http://localhost:3000/inicio`:

1. Barra inferior con cinco iconos: Inicio, Tareas, Hábitos, Progreso, Perfil.
2. El destino actual está en violeta; los demás en gris.
3. FAB con gradiente abajo a la derecha. Ábrelo: la hoja sube desde abajo con
   dos pestañas.
4. Escribe un título, elige prioridad Alta y pulsa "Añadir tarea". La hoja se
   cierra y la tarea aparece en la lista de abajo.
5. Ve a `/perfil`: **no hay FAB**.

A 1280px:

6. Barra lateral fija de 256px con "Avanza", el botón "Añadir" en gradiente, los
   cinco destinos, la lista de proyectos con su punto y su conteo, y
   "Gestionar proyectos" al pie.
7. No hay barra inferior ni FAB.
8. El botón "Añadir" abre la **misma** hoja, ahora centrada.

- [ ] **Paso 15: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 16: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `components/shell/is-active.ts` (nuevo)
- `components/shell/__tests__/is-active.test.ts` (nuevo)
- `components/shell/nav-items.ts` (nuevo)
- `components/shell/bottom-nav.tsx` (nuevo)
- `components/shell/sidebar.tsx` (nuevo)
- `components/shell/capture-provider.tsx` (nuevo)
- `components/shell/capture-sheet.tsx` (nuevo)
- `components/shell/capture-launcher.tsx` (nuevo)
- `components/shell/app-shell.tsx` (nuevo)
- `components/shell/app-shell-client.tsx` (nuevo)
- `app/(app)/layout.tsx` (nuevo)
- `app/layout.tsx`
- `app/nav.tsx` (**borrado**)

Mensaje sugerido: `feat(pulso): shell responsive y captura unificada de tareas`

---

## Tarea 19: Pestaña Hábito y retirada de los formularios incrustados

**Archivos:**
- Modificar: `components/shell/capture-sheet.tsx`
- Modificar: `app/(app)/inicio/page.tsx` (quitar `<QuickAdd />`)
- Modificar: `app/(app)/tareas/page.tsx` (quitar `<QuickAdd />`)
- Borrar: `features/tasks/components/quick-add.tsx`
- Modificar: `features/tasks/index.ts`

**Interfaces:**
- Consumes: `createHabit` con el campo `icon` (Tarea 10).
- Produce: la hoja completa, con las dos pestañas del prototipo.

**El `QuickAdd` incrustado desaparece.** Tener la captura en un solo lugar es lo
que permite que el FAB signifique siempre lo mismo en las tres pantallas donde
aparece. `NewHabitForm` **no** se borra: `/habitos` conserva el formulario
completo para editar color y meta semanal, campos que no caben cómodamente en
una hoja (Tarea 25).

- [ ] **Paso 1: Añadir el estado de la pestaña Hábito**

En `components/shell/capture-sheet.tsx`, añade al import de acciones:

```tsx
import { createHabit } from '@/features/habits';
```

Y después del bloque de estado de la tarea, añade:

```tsx
  const [habitName, setHabitName] = useState('');
  const [habitIcon, setHabitIcon] = useState('');
  const [cadence, setCadence] = useState<'daily' | 'weekly'>('daily');
  const [targetPerWeek, setTargetPerWeek] = useState(3);
```

Junto a la constante `PRIORITIES`, añade la paleta de emojis sugeridos:

```tsx
/** Atajo, no restricción: el campo acepta cualquier emoji que el usuario pegue. */
const SUGGESTED_ICONS = ['💧', '📚', '🏃', '🧘', '🌱', '💤', '🎧', '🍎'];
```

- [ ] **Paso 2: Añadir el envío del hábito**

Debajo de `submitTask`:

```tsx
  function resetHabit() {
    setHabitName('');
    setHabitIcon('');
    setCadence('daily');
    setTargetPerWeek(3);
  }

  function submitHabit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set('name', habitName);
    formData.set('icon', habitIcon);
    formData.set('cadence', cadence);
    // Un hábito diario no lleva meta; mandarla rompería el CHECK de la base.
    if (cadence === 'weekly') formData.set('targetPerWeek', String(targetPerWeek));

    startTransition(async () => {
      const result = await createHabit(formData);
      if (result.ok) {
        resetHabit();
        onClose();
      } else {
        setError(result.error);
      }
    });
  }
```

- [ ] **Paso 3: Pintar la pestaña Hábito**

Justo después del bloque `{tab === 'task' && ( … )}`, antes de cerrar `</Sheet>`:

```tsx
      {tab === 'habit' && (
        <form onSubmit={submitHabit} className="flex flex-col gap-5">
          <div className="flex gap-3">
            <input
              value={habitIcon}
              onChange={(event) => setHabitIcon(event.target.value)}
              maxLength={8}
              placeholder="🙂"
              aria-label="Emoji del hábito"
              className="w-16 shrink-0 rounded-md border border-border bg-surface px-3 py-3 text-center text-body outline-none focus:border-accent"
            />
            <input
              value={habitName}
              onChange={(event) => setHabitName(event.target.value)}
              required
              autoFocus
              placeholder="¿Qué quieres sostener?"
              aria-label="Nombre del hábito"
              className="min-w-0 flex-1 rounded-md border border-border bg-surface px-4 py-3 text-body text-text outline-none placeholder:text-text-muted focus:border-accent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setHabitIcon(emoji)}
                aria-label={`Usar ${emoji}`}
                className={`grid size-11 place-items-center rounded-md border transition-colors ${
                  habitIcon === emoji
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface-elevated hover:border-accent/40'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-caption uppercase text-text-muted">
              Cadencia
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              <Chip as="button" type="button" selected={cadence === 'daily'} onClick={() => setCadence('daily')}>
                Todos los días
              </Chip>
              <Chip as="button" type="button" selected={cadence === 'weekly'} onClick={() => setCadence('weekly')}>
                Veces por semana
              </Chip>
              {cadence === 'weekly' && (
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={targetPerWeek}
                  onChange={(event) => setTargetPerWeek(Number(event.target.value))}
                  aria-label="Veces por semana"
                  className="w-20 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-label text-text"
                />
              )}
            </div>
          </fieldset>

          <p className="text-label text-text-muted">
            El color y la meta detallada se editan desde Hábitos.
          </p>

          {error && <p className="text-label text-accent-warm">{error}</p>}

          <button
            type="submit"
            disabled={pending || habitName.trim() === ''}
            className="bg-brand-gradient w-full rounded-md py-3.5 text-label text-white shadow-glow transition-opacity disabled:opacity-40"
          >
            {pending ? 'Creando…' : 'Crear hábito'}
          </button>
        </form>
      )}
```

- [ ] **Paso 4: Limpiar el error al cambiar de pestaña**

Sustituye el `onClick` de los dos botones de pestaña para que también borren el
mensaje de error, que si no se arrastra de una pestaña a otra:

```tsx
          onClick={() => { setError(null); onTabChange('task'); }}
```

```tsx
          onClick={() => { setError(null); onTabChange('habit'); }}
```

- [ ] **Paso 5: Quitar el `QuickAdd` de las pantallas**

`app/(app)/inicio/page.tsx` — borra la línea `<QuickAdd projects={projects} />`
y quita `QuickAdd` del import de `@/features/tasks`. `projects` deja de usarse:
quítalo también de la desestructuración de `getTodayData()`.

`app/(app)/tareas/page.tsx` — borra la línea `<QuickAdd projects={projects} />`,
quita `QuickAdd` del import, y quita `listProjects()` del `Promise.all` y su
variable `projects`.

Actualiza los textos de vacío, que ya no pueden decir "arriba":

En `inicio/page.tsx`:

```tsx
          Nada pendiente para hoy. Usa el botón + para añadir algo.
```

En `tareas/page.tsx`:

```tsx
          No tienes tareas pendientes. Usa el botón + para crear la primera.
```

- [ ] **Paso 6: Borrar el componente y su export**

```powershell
Remove-Item features\tasks\components\quick-add.tsx
```

`features/tasks/index.ts` — borra la línea:

```ts
export { QuickAdd } from './components/quick-add';
```

- [ ] **Paso 7: Verificar a mano**

```powershell
npm run dev
```

1. En `/inicio` y `/tareas` ya no hay formulario incrustado.
2. El FAB abre la hoja. Pestaña **Hábito**: pon un emoji de la paleta, un
   nombre, deja "Todos los días" y crea. Ve a `/habitos`: el hábito está.
3. Repite con "Veces por semana" y meta 3. Se crea sin error de `CHECK`.
4. Intenta crear un hábito semanal con el campo de meta vacío: el `number`
   impide enviar; si se fuerza, el mensaje en español de Zod aparece bajo el
   formulario y no revienta la página.

- [ ] **Paso 8: Comprobar que el emoji llegó a la base**

Herramienta: `mcp__claude_ai_Supabase__execute_sql`, `project_id`
`nozxsibtojorqhloxgxq`:

```sql
select name, icon, cadence, target_per_week
from public.habits
order by created_at desc
limit 5;
```

Esperado: los hábitos recién creados traen su emoji en `icon`.

- [ ] **Paso 9: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 10: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `components/shell/capture-sheet.tsx`
- `app/(app)/inicio/page.tsx`
- `app/(app)/tareas/page.tsx`
- `features/tasks/components/quick-add.tsx` (**borrado**)
- `features/tasks/index.ts`

Mensaje sugerido: `feat(pulso): pestaña de hábito en la hoja y retirada del QuickAdd`

---

→ Continúa en [05 — Pantalla Inicio](05-pantalla-inicio.md)

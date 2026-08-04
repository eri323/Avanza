# 08 — Progreso, perfil y resto (Tareas 27–30)

← [07 — Hábitos y detalle](07-habitos-y-detalle.md) · → [09 — Pruebas y cierre](09-pruebas-y-cierre.md)

**Entrega de este archivo:** las cuatro pantallas que faltan. Al terminar,
`/progreso` existe —la barra inferior deja de llevar a un 404— y ninguna
pantalla de Avanza conserva la piel del scaffold.

Lee las **Restricciones globales** del [README](README.md#restricciones-globales).

**Lo que no se pinta porque no se deriva.** Logros, retos mensuales y XP como
saldo acumulado que no se pierde son estado almacenado y pertenecen al bloque 4.
`/progreso` se apoya mientras tanto en el gráfico semanal y las rachas, que sí
tienen datos detrás. No inventes tarjetas de logros "para que no quede vacío".

---

## Tarea 27: `/progreso`

**Archivos:**
- Modificar: `lib/dates.ts`
- Modificar: `lib/__tests__/dates.test.ts`
- Modificar: `features/progress/queries.ts`
- Modificar: `features/progress/index.ts`
- Crear: `features/progress/components/weekly-chart.tsx`
- Crear: `app/(app)/progreso/page.tsx`

**Interfaces:**
- Consumes: `getWeeklyXp`, `getLevel` (Tarea 16); `globalStreak`, `bestStreak`
  (Tarea 13); `listHabitsWithProgress`; `StatTile`, `Card`, `ProgressBar`,
  `HabitsIcon`, `SparkIcon`.
- Produce:
  - `weekdayLetter(date: IsoDate): string` en `lib/dates.ts`
  - ```ts
    type ProgressData = {
      today: IsoDate;
      week: DayPoint[];
      level: LevelInfo & { totalXp: number };
      streak: number;
      bestGlobalStreak: number;
      activeDays: number;
      weekXp: number;
    };
    ```
  - `getProgressData(): Promise<ProgressData>`
  - `<WeeklyChart week />`

- [ ] **Paso 1: Escribir el test que falla**

Añade a `lib/__tests__/dates.test.ts`:

```ts
import { weekdayLetter } from '@/lib/dates';

describe('weekdayLetter', () => {
  it('devuelve la inicial del día en español', () => {
    // 2026-08-03 es lunes.
    expect(weekdayLetter('2026-08-03')).toBe('L');
    expect(weekdayLetter('2026-08-04')).toBe('M');
    expect(weekdayLetter('2026-08-05')).toBe('X');
    expect(weekdayLetter('2026-08-06')).toBe('J');
    expect(weekdayLetter('2026-08-07')).toBe('V');
    expect(weekdayLetter('2026-08-08')).toBe('S');
    expect(weekdayLetter('2026-08-09')).toBe('D');
  });
});
```

- [ ] **Paso 2: Correr el test y comprobar que falla**

```powershell
npx vitest run lib/__tests__/dates.test.ts
```

Esperado: FAIL — `weekdayLetter is not a function`.

- [ ] **Paso 3: Escribir `weekdayLetter`**

En `lib/dates.ts`, después de `formatDayMonth`:

```ts
const WEEKDAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/**
 * Inicial del día, con la semana empezando en lunes como en el resto de la app.
 * A mano y no con `Intl`: la inicial de miércoles en español es X por
 * convención, y ningún locale la devuelve así.
 */
export function weekdayLetter(date: IsoDate): string {
  const dayOfWeek = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
  return WEEKDAY_LETTERS[dayOfWeek];
}
```

- [ ] **Paso 4: Correr el test y comprobar que pasa**

```powershell
npx vitest run lib/__tests__/dates.test.ts
```

Esperado: PASS.

- [ ] **Paso 5: Añadir `getProgressData`**

`features/progress/queries.ts` — añade los imports que faltan en la cabecera:

```ts
import { bestStreak, globalStreak } from '@/lib/streaks';
// De los módulos concretos y no de los barriles, por la misma razón que en
// `features/today/queries.ts`: los barriles reexportan componentes de cliente.
import { getProfile } from '@/features/profile/queries';
import { listHabitsWithProgress } from '@/features/habits/queries';
```

Y añade al final del archivo:

```ts
export type ProgressData = {
  today: IsoDate;
  week: DayPoint[];
  level: LevelInfo & { totalXp: number };
  streak: number;
  bestGlobalStreak: number;
  activeDays: number;
  weekXp: number;
};

/**
 * Todo lo de esta pantalla se deriva de lo que ya hay en la base. No hay
 * consultas nuevas para "logros" o "retos": ese estado no existe y pertenece al
 * bloque 4.
 */
export async function getProgressData(): Promise<ProgressData> {
  const profile = await getProfile();
  const today = todayIn(profile.timezone);

  const [week, level, habits] = await Promise.all([
    getWeeklyXp(today, profile.timezone),
    getLevel(),
    listHabitsWithProgress(today),
  ]);

  const entryDatesByHabit = habits.map((habit) => habit.entryDates);

  return {
    today,
    week,
    level,
    streak: globalStreak(entryDatesByHabit, today),
    bestGlobalStreak: bestStreak(
      entryDatesByHabit.flat(),
      { type: 'daily' },
      today,
    ),
    activeDays: week.filter((point) => point.xp > 0).length,
    weekXp: week.reduce((total, point) => total + point.xp, 0),
  };
}
```

`features/progress/index.ts` — añade:

```ts
export { getProgressData, type ProgressData } from './queries';
```

- [ ] **Paso 6: Escribir el gráfico**

`features/progress/components/weekly-chart.tsx`:

```tsx
import { weekdayLetter } from '@/lib/dates';
import type { DayPoint } from '@/lib/xp';

/**
 * Barras proporcionales al mejor día de la semana, no a una escala fija: con
 * escala fija una semana tranquila se vería como un fracaso y una intensa se
 * saldría del marco.
 */
export function WeeklyChart({ week }: { week: DayPoint[] }) {
  const peak = Math.max(...week.map((point) => point.xp), 1);

  return (
    <div className="flex items-end justify-between gap-2" role="group" aria-label="XP de los últimos siete días">
      {week.map((point, index) => {
        const isToday = index === week.length - 1;
        const height = Math.round((point.xp / peak) * 100);

        return (
          <div key={point.date} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-caption text-text-muted">{point.xp}</span>
            <div className="flex h-28 w-full items-end">
              <div
                title={`${point.date}: ${point.xp} XP`}
                className={`w-full rounded-xs transition-[height] duration-500 ${
                  isToday ? 'bg-brand-gradient' : 'bg-accent/35'
                }`}
                // 4px mínimos: una barra de altura cero no se distingue de un
                // día que no se ha pintado.
                style={{ height: `${Math.max(height, 4)}%` }}
              />
            </div>
            <span
              className={`text-caption ${isToday ? 'text-accent' : 'text-text-muted'}`}
            >
              {weekdayLetter(point.date)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Paso 7: Escribir la pantalla**

`app/(app)/progreso/page.tsx`:

```tsx
import { Card, HabitsIcon, ProgressBar, SparkIcon, StatTile } from '@/components/ui';
import { getProgressData } from '@/features/progress';
import { WeeklyChart } from '@/features/progress/components/weekly-chart';

export default async function ProgresoPage() {
  const { week, level, streak, bestGlobalStreak, activeDays, weekXp } =
    await getProgressData();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display text-text">Progreso</h1>

      <Card tone="feature" className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-caption uppercase text-on-feature-soft">
              Nivel {level.level}
            </span>
            <span className="text-display text-on-feature">
              {level.totalXp} XP
            </span>
          </div>
          <SparkIcon className="size-7 text-accent-amber" />
        </div>
        <ProgressBar
          percent={level.percent}
          label={`Avance al nivel ${level.level + 1}`}
        />
        <p className="text-caption text-on-feature-soft">
          {level.xpIntoLevel} / {level.xpForNextLevel} XP para el nivel{' '}
          {level.level + 1}
        </p>
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-heading text-text">Los últimos siete días</h2>
          <span className="text-label text-text-soft">{weekXp} XP</span>
        </div>
        <WeeklyChart week={week} />
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          value={String(streak)}
          label="Racha global"
          icon={<HabitsIcon className="size-5" />}
        />
        <StatTile value={String(bestGlobalStreak)} label="Mejor racha" />
        <StatTile value={`${activeDays}/7`} label="Días activos" />
      </div>
    </div>
  );
}
```

- [ ] **Paso 8: Verificar a mano**

```powershell
npm run dev
```

En `/progreso`:

1. La ruta ya no da 404 y la pestaña Progreso de la barra inferior queda
   marcada en violeta.
2. Tarjeta oscura con el nivel, el XP total y la barra de avance.
3. Siete barras con su valor encima y su inicial debajo, L a D según toque; la
   de hoy en gradiente.
4. Tres fichas: racha global, mejor racha, días activos.
5. Marca una tarea en `/inicio` y vuelve: el XP total y la barra de hoy suben.

- [ ] **Paso 9: Comprobar el nivel contra la base**

Con el resultado que guardaste en el Paso 7 de la Tarea 16, más:

```sql
select count(*) as marcas from public.habit_entries;
```

Calcula a mano `20·none + 40·low + 60·medium + 100·high + 50·marcas`. Esperado:
es exactamente el "XP total" de la tarjeta, y `floor(sqrt(total/500)) + 1` es el
nivel que se enseña. Si no cuadra, **para**.

- [ ] **Paso 10: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 11: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `lib/dates.ts`
- `lib/__tests__/dates.test.ts`
- `features/progress/queries.ts`
- `features/progress/index.ts`
- `features/progress/components/weekly-chart.tsx` (nuevo)
- `app/(app)/progreso/page.tsx` (nuevo)

Mensaje sugerido: `feat(pulso): pantalla de progreso con XP semanal y rachas`

---

## Tarea 28: `/perfil`

**Archivos:**
- Reemplazar: `app/(app)/perfil/page.tsx`
- Reemplazar: `app/(app)/perfil/timezone-form.tsx`

**Interfaces:**
- Consumes: `getProfile` con `email` (Tarea 16); `ThemeToggle` (Tarea 3);
  `updateTimezone`; `Card`, `FolderIcon`, `ChevronRightIcon`.

- [ ] **Paso 1: Reescribir el formulario de zona horaria**

`app/(app)/perfil/timezone-form.tsx`:

```tsx
'use client';

import { useState, useTransition } from 'react';
import { updateTimezone } from '@/features/profile/actions';

const TIMEZONES = [
  'America/Mexico_City',
  'America/Bogota',
  'America/Lima',
  'America/Santiago',
  'America/Argentina/Buenos_Aires',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/Madrid',
  'UTC',
];

export function TimezoneForm({ current }: { current: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateTimezone(formData);
      setStatus(result.ok ? 'Guardado.' : result.error);
    });
  }

  return (
    <form
      action={handleSubmit}
      className="flex flex-col gap-3 rounded-md border border-border bg-surface-elevated p-4"
    >
      <label htmlFor="timezone" className="text-label text-text">
        Zona horaria
      </label>
      <p className="text-caption text-text-muted">
        Define qué día es &ldquo;hoy&rdquo; para tus tareas y hábitos.
      </p>
      <select
        id="timezone"
        name="timezone"
        defaultValue={current}
        className="rounded-xs border border-border bg-surface px-3 py-2.5 text-body text-text"
      >
        {TIMEZONES.map((tz) => (
          <option key={tz} value={tz}>
            {tz}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-xs border border-border px-4 py-2 text-label text-text-soft transition-colors hover:border-accent/40 disabled:opacity-40"
      >
        {pending ? 'Guardando…' : 'Guardar'}
      </button>
      {status && <p className="text-label text-text-soft">{status}</p>}
    </form>
  );
}
```

- [ ] **Paso 2: Reescribir la pantalla**

`app/(app)/perfil/page.tsx`:

```tsx
import Link from 'next/link';
import { ChevronRightIcon, FolderIcon } from '@/components/ui';
import { ThemeToggle } from '@/components/shell/theme-toggle';
import { getProfile } from '@/features/profile';
import { TimezoneForm } from './timezone-form';

export default async function PerfilPage() {
  const profile = await getProfile();

  const name = profile.displayName?.trim();
  const initial = (name ?? profile.email).charAt(0).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display text-text">Perfil</h1>

      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className="bg-brand-gradient grid size-16 shrink-0 place-items-center rounded-xl text-title text-white"
        >
          {initial}
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-heading text-text">
            {name ?? 'Sin nombre'}
          </span>
          <span className="truncate text-label text-text-muted">
            {profile.email}
          </span>
        </div>
      </div>

      <TimezoneForm current={profile.timezone} />

      <ThemeToggle />

      <Link
        href="/proyectos"
        className="flex items-center gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3.5 transition-colors hover:border-accent/40"
      >
        <FolderIcon className="size-5 text-accent" />
        <span className="flex-1 text-label text-text">Proyectos</span>
        <ChevronRightIcon className="size-5 text-text-muted" />
      </Link>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="w-full rounded-md border border-border px-4 py-3.5 text-label text-accent-warm transition-colors hover:border-accent-warm/40"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Paso 3: Verificar a mano**

```powershell
npm run dev
```

En `/perfil`:

1. Avatar circular con gradiente y la inicial; al lado, nombre (o "Sin nombre")
   y correo.
2. El selector de zona horaria guarda y dice "Guardado.".
3. El interruptor de tema cambia la app entera al instante. **Recarga**: se
   queda como lo dejaste, sin destello.
4. "Proyectos" lleva a `/proyectos`.
5. "Cerrar sesión" devuelve a `/login`.
6. `/ajustes` sigue redirigiendo aquí.

- [ ] **Paso 4: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 5: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `app/(app)/perfil/page.tsx`
- `app/(app)/perfil/timezone-form.tsx`

Mensaje sugerido: `feat(pulso): pantalla de perfil con tema y accesos`

---

## Tarea 29: `/proyectos` y `/proyectos/[id]`

**Archivos:**
- Reemplazar: `app/(app)/proyectos/page.tsx`
- Reemplazar: `app/(app)/proyectos/new-project-form.tsx`
- Reemplazar: `app/(app)/proyectos/[id]/page.tsx`

**Interfaces:**
- Consumes: `listProjectsWithCounts` (Tarea 15); `listTasksForProject`;
  `createProject`; `TaskItem`; `Card`, `ProgressBar`, `ChevronLeftIcon`,
  `ChevronRightIcon`, `PlusIcon`.

**La pantalla de gestión sobrevive íntegra; sólo cambia desde dónde se llega a
ella.** Reciben la piel nueva aunque no sean destinos ni aparezcan en el
prototipo.

- [ ] **Paso 1: Reescribir el formulario de proyecto**

`app/(app)/proyectos/new-project-form.tsx`:

```tsx
'use client';

import { useRef, useState, useTransition } from 'react';
import { PlusIcon } from '@/components/ui';
import { createProject } from '@/features/projects';

export function NewProjectForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProject(formData);
      if (result.ok) {
        formRef.current?.reset();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <form ref={formRef} action={handleSubmit} className="flex gap-2">
        <input
          name="name"
          required
          placeholder="Nuevo proyecto"
          className="min-w-0 flex-1 rounded-md border border-border bg-surface-elevated px-4 py-3 text-body text-text outline-none placeholder:text-text-muted focus:border-accent"
        />
        <input
          name="color"
          type="color"
          defaultValue="#6366F1"
          aria-label="Color del proyecto"
          className="h-12 w-14 shrink-0 rounded-md border border-border bg-transparent"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Crear proyecto"
          className="bg-brand-gradient grid size-12 shrink-0 place-items-center rounded-md text-white shadow-glow disabled:opacity-40"
        >
          <PlusIcon className="size-6" />
        </button>
      </form>
      {error && <p className="text-label text-accent-warm">{error}</p>}
    </div>
  );
}
```

Comprueba que `features/projects/index.ts` exporta `createProject`; si el
formulario lo importaba de `@/features/projects/actions`, deja ese import.

- [ ] **Paso 2: Reescribir la lista**

`app/(app)/proyectos/page.tsx`:

```tsx
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui';
import { listProjectsWithCounts } from '@/features/projects';
import { NewProjectForm } from './new-project-form';

export default async function ProyectosPage() {
  const projects = await listProjectsWithCounts();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/perfil"
        className="flex items-center gap-1 text-label text-text-soft transition-colors hover:text-accent lg:hidden"
      >
        <ChevronLeftIcon className="size-5" />
        Perfil
      </Link>

      <h1 className="text-display text-text">Proyectos</h1>

      <NewProjectForm />

      {projects.length === 0 ? (
        <p className="text-body text-text-muted">
          Aún no tienes proyectos. Crea el primero arriba.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/proyectos/${project.id}`}
                className="flex items-center gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3.5 transition-colors hover:border-accent/40"
              >
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-xl"
                  style={{ backgroundColor: project.color }}
                />
                <span className="min-w-0 flex-1 truncate text-body text-text">
                  {project.name}
                </span>
                <span className="shrink-0 text-caption text-text-muted">
                  {project.pendingCount} pendientes
                </span>
                <ChevronRightIcon className="size-5 shrink-0 text-text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Paso 3: Reescribir el detalle de proyecto**

`app/(app)/proyectos/[id]/page.tsx`:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, ChevronLeftIcon, ProgressBar } from '@/components/ui';
import { listProjects } from '@/features/projects';
import { listTasksForProject, TaskItem } from '@/features/tasks';

export default async function ProyectoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [projects, tasks] = await Promise.all([
    listProjects(),
    listTasksForProject(id),
  ]);

  // RLS hace que un id ajeno simplemente no aparezca en listProjects.
  const project = projects.find((candidate) => candidate.id === id);
  if (!project) notFound();

  const done = tasks.filter((task) => task.completedAt !== null).length;
  const percent = tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/proyectos"
        className="flex items-center gap-1 text-label text-text-soft transition-colors hover:text-accent"
      >
        <ChevronLeftIcon className="size-5" />
        Proyectos
      </Link>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="size-3.5 shrink-0 rounded-xl"
            style={{ backgroundColor: project.color }}
          />
          <h1 className="min-w-0 flex-1 truncate text-title text-text">
            {project.name}
          </h1>
          <span className="text-title text-accent">{percent}%</span>
        </div>
        <ProgressBar
          percent={percent}
          label={`Avance de ${project.name}`}
          tone="accent"
        />
        <p className="text-caption text-text-muted">
          {done} de {tasks.length} completadas
        </p>
      </Card>

      {tasks.length === 0 ? (
        <p className="text-body text-text-muted">
          Este proyecto todavía no tiene tareas.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} href={`/tareas/${task.id}`} />
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Paso 4: Verificar a mano**

```powershell
npm run dev
```

1. `/proyectos` desde el pie de la barra lateral en escritorio y desde `/perfil`
   en móvil.
2. Crea un proyecto con color: aparece en la lista, en la barra lateral y como
   chip en `/tareas`.
3. Cada fila muestra su conteo de pendientes y lleva al detalle.
4. En el detalle, la barra y el porcentaje coinciden con "N de M completadas".
5. Pulsar el título de una tarea del proyecto lleva a `/tareas/<id>`.
6. Un id inventado da 404.

- [ ] **Paso 5: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 6: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `app/(app)/proyectos/page.tsx`
- `app/(app)/proyectos/new-project-form.tsx`
- `app/(app)/proyectos/[id]/page.tsx`

Mensaje sugerido: `feat(pulso): proyectos con la piel nueva`

---

## Tarea 30: `/login`

**Archivos:**
- Reemplazar: `app/login/page.tsx` (sólo la capa visual)

**Interfaces:**
- Consumes: `signInWithEmail`, `signInWithPassword`, `signUpWithPassword` (sin
  cambios).

**La lógica no se toca.** Los tres manejadores, el `router.refresh()` y los
destinos son los de la Tarea 17. Lo único que cambia son las clases y el marco.

`/login` está fuera del grupo `(app)`: no lleva barra de navegación ni FAB,
porque quien no ha entrado no tiene a dónde navegar.

- [ ] **Paso 1: Reescribir la pantalla**

`app/login/page.tsx`:

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  signInWithEmail,
  signInWithPassword,
  signUpWithPassword,
} from './actions';

type Mode = 'link' | 'password';

const FIELD =
  'rounded-md border border-border bg-surface-elevated px-4 py-3 text-body text-text outline-none placeholder:text-text-muted focus:border-accent';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('link');
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run(
    action: (formData: FormData) => Promise<{ ok: boolean; error?: string }>,
    formData: FormData,
    onSuccess: () => void,
  ) {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        onSuccess();
      } else {
        setError(result.error ?? 'Algo salió mal.');
      }
    });
  }

  function handleMagicLink(formData: FormData) {
    run(signInWithEmail, formData, () =>
      setMessage('Te enviamos un enlace. Revisa tu correo.'),
    );
  }

  function handleSignIn(formData: FormData) {
    // La Server Action ya dejó las cookies de sesión; refresh() hace que el
    // proxy las vea y redirija.
    run(signInWithPassword, formData, () => {
      router.refresh();
      router.push('/inicio');
    });
  }

  function handleSignUp(formData: FormData) {
    run(signUpWithPassword, formData, () => {
      router.refresh();
      router.push('/inicio');
    });
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-6">
      <div className="flex flex-col gap-2">
        <span
          aria-hidden
          className="bg-brand-gradient mb-2 grid size-14 place-items-center rounded-xl text-title text-white"
        >
          A
        </span>
        <h1 className="text-display text-text">Avanza</h1>
        <p className="text-body text-text-soft">
          Tus tareas y hábitos en un solo lugar.
        </p>
      </div>

      {mode === 'link' ? (
        <form action={handleMagicLink} className="flex flex-col gap-3">
          <label htmlFor="email" className="text-label text-text">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className={FIELD}
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-brand-gradient rounded-md py-3.5 text-label text-white shadow-glow disabled:opacity-40"
          >
            {pending ? 'Enviando…' : 'Enviar enlace'}
          </button>
        </form>
      ) : (
        <form className="flex flex-col gap-3">
          <label htmlFor="email" className="text-label text-text">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className={FIELD}
          />
          <label htmlFor="password" className="text-label text-text">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            className={FIELD}
          />
          <button
            type="submit"
            formAction={handleSignIn}
            disabled={pending}
            className="bg-brand-gradient rounded-md py-3.5 text-label text-white shadow-glow disabled:opacity-40"
          >
            {pending ? 'Entrando…' : 'Entrar'}
          </button>
          <button
            type="submit"
            formAction={handleSignUp}
            disabled={pending}
            className="rounded-md border border-border py-3.5 text-label text-text-soft transition-colors hover:border-accent/40 disabled:opacity-40"
          >
            Crear cuenta
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => {
          setMode(mode === 'link' ? 'password' : 'link');
          setMessage(null);
          setError(null);
        }}
        className="self-start text-label text-text-muted underline"
      >
        {mode === 'link' ? 'Usar contraseña' : 'Usar enlace por correo'}
      </button>

      {message && <p className="text-label text-accent">{message}</p>}
      {error && <p className="text-label text-accent-warm">{error}</p>}
    </main>
  );
}
```

- [ ] **Paso 2: Verificar a mano**

```powershell
npm run dev
```

1. En `/login` no hay barra inferior ni barra lateral.
2. "Usar contraseña" cambia el formulario; "Usar enlace por correo" vuelve.
3. Crea una cuenta nueva: acaba en `/inicio`, con el shell montado.
4. Cierra sesión desde `/perfil` y entra con esa cuenta: acaba en `/inicio`.
5. Con sesión abierta, visitar `/login` a mano redirige a `/inicio`.
6. Cambia el tema desde `/perfil`, cierra sesión: `/login` respeta el tema. El
   script inline vive en el layout raíz, no en el grupo `(app)`.

- [ ] **Paso 3: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 4: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `app/login/page.tsx`

Mensaje sugerido: `feat(pulso): pantalla de acceso con la piel nueva`

---

→ Continúa en [09 — Pruebas y cierre](09-pruebas-y-cierre.md)

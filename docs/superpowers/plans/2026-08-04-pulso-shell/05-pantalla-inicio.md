# 05 — Pantalla Inicio (Tareas 20–21)

← [04 — Shell, navegación y captura](04-shell-navegacion-y-captura.md) · → [06 — Tareas y detalle](06-tareas-y-detalle.md)

**Entrega de este archivo:** `/inicio` completa —saludo, nivel, aviso real,
progreso del día, chips de hábitos y tareas— con la reversión optimista
cubriendo también el XP, la barra y el aviso.

Lee las **Restricciones globales** del [README](README.md#restricciones-globales).

---

## Tarea 20: `getHomeData`

**Archivos:**
- Modificar: `features/profile/queries.ts` (memorizar `getProfile`)
- Modificar: `features/today/queries.ts`
- Modificar: `features/today/index.ts`
- Modificar: `lib/dates.ts`
- Modificar: `lib/__tests__/dates.test.ts`

**Interfaces:**
- Consumes: `listDueUpToToday` (Tarea 15), `listHabitsWithProgress` (Tarea 10),
  `getLevel` (Tarea 16), `greetingFor` y `hourIn` (Tarea 14).
- Produce:
  - `formatDayMonth(date: IsoDate): string` en `lib/dates.ts` — "2 de julio".
  - ```ts
    type HomeData = {
      today: IsoDate;
      greeting: string;
      displayName: string | null;
      dayTasks: Task[];              // due_date <= hoy, completadas incluidas
      habits: HabitWithProgress[];
      level: LevelInfo & { totalXp: number };
    };
    ```
  - `getHomeData(): Promise<HomeData>`
- Reemplaza a `getTodayData`, que se borra.

- [ ] **Paso 1: Escribir el test que falla**

Añade a `lib/__tests__/dates.test.ts`:

```ts
import { formatDayMonth } from '@/lib/dates';

describe('formatDayMonth', () => {
  it('escribe la fecha en español y sin año', () => {
    expect(formatDayMonth('2026-07-02')).toBe('2 de julio');
    expect(formatDayMonth('2026-12-25')).toBe('25 de diciembre');
  });

  it('no se corre de día por la zona horaria del servidor', () => {
    expect(formatDayMonth('2026-01-01')).toBe('1 de enero');
  });
});
```

- [ ] **Paso 2: Correr el test y comprobar que falla**

```powershell
npx vitest run lib/__tests__/dates.test.ts
```

Esperado: FAIL — `formatDayMonth is not a function`.

- [ ] **Paso 3: Escribir `formatDayMonth`**

En `lib/dates.ts`, justo después de `hourIn`:

```ts
/**
 * "2 de julio". Sin año porque sólo se usa para fechas cercanas, donde el año
 * es ruido.
 *
 * `timeZone: 'UTC'` es obligatorio: la fecha ya viene resuelta al día del
 * usuario y formatearla en la zona del servidor la correría un día en Vercel.
 */
export function formatDayMonth(date: IsoDate): string {
  return new Intl.DateTimeFormat('es', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}
```

- [ ] **Paso 4: Correr el test y comprobar que pasa**

```powershell
npx vitest run lib/__tests__/dates.test.ts
```

Esperado: PASS.

- [ ] **Paso 5: Memorizar `getProfile`**

El shell pide el "hoy" del usuario y la pantalla pide el perfil entero: sin
memorizar, cada render de `/inicio` haría dos veces la misma consulta.

`features/profile/queries.ts` — añade el import y envuelve la función:

```ts
import { cache } from 'react';
```

```ts
/** `cache` de React: una sola consulta por render aunque el shell y la pantalla
 *  lo pidan por separado. */
export const getProfile = cache(async function getProfile(): Promise<Profile> {
  // …cuerpo sin cambios…
});
```

- [ ] **Paso 6: Reescribir `features/today/queries.ts`**

```ts
import 'server-only';

import { todayIn, hourIn, type IsoDate } from '@/lib/dates';
import { greetingFor } from '@/lib/greeting';
import type { LevelInfo } from '@/lib/xp';
// Se importa de los módulos concretos y no de los barriles: los barriles de
// `tasks` y `habits` reexportan componentes de cliente, y arrastrarlos a un
// módulo `server-only` mete en el bundle código que esta consulta no usa.
import { getProfile } from '@/features/profile/queries';
import { listDueUpToToday } from '@/features/tasks/queries';
import type { Task } from '@/features/tasks/types';
import { listHabitsWithProgress } from '@/features/habits/queries';
import type { HabitWithProgress } from '@/features/habits/types';
import { getLevel } from '@/features/progress/queries';

export type HomeData = {
  today: IsoDate;
  greeting: string;
  displayName: string | null;
  /**
   * Todo lo que vencía hoy o antes, completado o no: es a la vez la lista que
   * se pinta y el pozo del que salen el XP ganado y la meta del día. Separarlo
   * en dos consultas sería la forma de que la barra y la lista se
   * contradijeran.
   */
  dayTasks: Task[];
  habits: HabitWithProgress[];
  level: LevelInfo & { totalXp: number };
};

export async function getHomeData(): Promise<HomeData> {
  const profile = await getProfile();
  const today = todayIn(profile.timezone);

  const [dayTasks, habits, level] = await Promise.all([
    listDueUpToToday(today),
    listHabitsWithProgress(today),
    getLevel(),
  ]);

  return {
    today,
    greeting: greetingFor(hourIn(profile.timezone)),
    displayName: profile.displayName,
    dayTasks,
    habits,
    level,
  };
}
```

- [ ] **Paso 7: Actualizar el barril**

`features/today/index.ts`:

```ts
export { getHomeData, type HomeData } from './queries';
```

- [ ] **Paso 8: Verificar**

```powershell
npm run test; if ($?) { npm run typecheck }
```

Esperado: los tests pasan. `typecheck` **falla** en
`app/(app)/inicio/page.tsx`, que todavía importa `getTodayData`. Es lo esperado:
lo arregla la Tarea 21, que es su par. No corras `lint` ni `build` aquí.

- [ ] **Paso 9: Reportar al autor**

**No ejecutes git.** Esta tarea y la 21 forman un solo commit; reporta ambas
juntas al terminar la 21. Archivos tocados hasta aquí:

- `lib/dates.ts`
- `lib/__tests__/dates.test.ts`
- `features/profile/queries.ts`
- `features/today/queries.ts`
- `features/today/index.ts`

---

## Tarea 21: La pantalla `/inicio`

**Archivos:**
- Crear: `features/today/components/today-board.tsx`
- Crear: `features/today/components/notice-card.tsx`
- Crear: `features/today/components/habit-chip.tsx`
- Crear: `features/today/components/task-row.tsx`
- Modificar: `features/today/index.ts`
- Reemplazar: `app/(app)/inicio/page.tsx`
- Modificar: `features/tasks/components/task-item.tsx` (piel nueva)

**Interfaces:**
- Consumes: `HomeData` (Tarea 20); `dayXp` (Tarea 11); `pickNotice` (Tarea 12);
  `Card`, `Chip`, `ProgressBar`, `CheckBox`, `AlertIcon`, `SparkIcon`,
  `HabitsIcon` (Tareas 4–9); `setTaskCompleted`, `toggleHabitEntry` (ya
  existían); `formatDayMonth` (Tarea 20).
- Produce: `<TodayBoard>`, consumido sólo por `/inicio`.

**La reversión deshace el XP, la barra y el aviso, no sólo la casilla.** Los
tres se derivan del mismo estado local. Si sólo se revirtiera la casilla, el
usuario vería una tarea sin marcar y unos puntos que sí se sumaron. Por eso el
estado optimista de tareas y hábitos vive en **un solo** `useOptimistic`, y el
XP y el aviso se calculan a partir de él en cada render.

- [ ] **Paso 1: Escribir la tarjeta de aviso**

`features/today/components/notice-card.tsx`:

```tsx
import { AlertIcon, Card, HabitsIcon } from '@/components/ui';
import { formatDayMonth } from '@/lib/dates';
import type { Notice } from '@/lib/notice';

/**
 * En el prototipo este espacio lo ocupa un mensaje de IA inventado. Se conserva
 * el tratamiento visual y se llena con información real y accionable.
 */
export function NoticeCard({ notice }: { notice: Notice }) {
  // Si no hay nada que decir, la tarjeta no se pinta.
  if (notice === null) return null;

  const { icon, title, body } =
    notice.kind === 'streak-at-risk'
      ? {
          icon: <HabitsIcon className="size-5" />,
          title: `Tu racha de ${notice.habitName} está en juego`,
          body: `Llevas ${notice.streak} días seguidos. Márcalo hoy y sigue.`,
        }
      : {
          icon: <AlertIcon className="size-5" />,
          title:
            notice.count === 1
              ? 'Tienes una tarea vencida'
              : `Tienes ${notice.count} tareas vencidas`,
          body: `La más antigua venció el ${formatDayMonth(notice.oldestDueDate)}.`,
        };

  return (
    <Card tone="feature" className="flex items-start gap-4">
      <span className="mt-0.5 shrink-0 text-accent-amber">{icon}</span>
      <div className="flex flex-col gap-1">
        <p className="text-heading text-on-feature">{title}</p>
        <p className="text-body text-on-feature-soft">{body}</p>
      </div>
    </Card>
  );
}
```

- [ ] **Paso 2: Escribir el chip de hábito**

`features/today/components/habit-chip.tsx`:

```tsx
'use client';

export function HabitChip({
  name,
  icon,
  color,
  done,
  streak,
  onToggle,
  disabled,
}: {
  name: string;
  icon: string | null;
  /** Color literal del hábito, elegido por el usuario. */
  color: string;
  done: boolean;
  streak: number;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={`Marcar ${name} hoy`}
      disabled={disabled}
      onClick={onToggle}
      className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all disabled:opacity-40 ${
        done
          ? 'border-transparent text-white'
          : 'border-border bg-surface-elevated text-text-soft hover:border-accent/40'
      }`}
      style={done ? { backgroundColor: color } : undefined}
    >
      <span aria-hidden className="text-body leading-none">
        {icon ?? '•'}
      </span>
      <span className="text-label">{name}</span>
      {streak > 0 && (
        <span
          className={`text-caption ${done ? 'text-white/80' : 'text-text-muted'}`}
        >
          {streak}
        </span>
      )}
    </button>
  );
}
```

- [ ] **Paso 3: Escribir la fila de tarea**

`features/today/components/task-row.tsx`:

```tsx
'use client';

import { CheckBox } from '@/components/ui';
import { formatDayMonth, type IsoDate } from '@/lib/dates';
import type { TaskPriority } from '@/features/tasks';

const PRIORITY_DOT: Record<TaskPriority, string | null> = {
  none: null,
  low: '#8B7FA8',
  medium: '#FF9C5B',
  high: '#FF5E7E',
};

export function TaskRow({
  title,
  priority,
  dueDate,
  done,
  overdue,
  onToggle,
  disabled,
}: {
  title: string;
  priority: TaskPriority;
  dueDate: IsoDate | null;
  done: boolean;
  overdue: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  const dot = PRIORITY_DOT[priority];

  return (
    <li className="flex items-center gap-3 rounded-md border border-border bg-surface-elevated px-4 py-3">
      <CheckBox
        checked={done}
        onToggle={onToggle}
        disabled={disabled}
        label={`Completar ${title}`}
      />
      {dot && (
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-xl"
          style={{ backgroundColor: dot }}
        />
      )}
      <span
        className={`min-w-0 flex-1 truncate text-body ${
          done ? 'text-text-muted line-through' : 'text-text'
        }`}
      >
        {title}
      </span>
      {dueDate && (
        <span
          className={`shrink-0 text-caption ${
            overdue && !done ? 'text-accent-warm' : 'text-text-muted'
          }`}
        >
          {formatDayMonth(dueDate)}
        </span>
      )}
    </li>
  );
}
```

- [ ] **Paso 4: Escribir el tablero optimista**

`features/today/components/today-board.tsx`:

```tsx
'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { Card, ProgressBar } from '@/components/ui';
import type { IsoDate } from '@/lib/dates';
import { pickNotice } from '@/lib/notice';
import { dayXp } from '@/lib/xp';
import { toggleHabitEntry } from '@/features/habits';
import { setTaskCompleted } from '@/features/tasks';
import type { TaskPriority } from '@/features/tasks';
import { HabitChip } from './habit-chip';
import { NoticeCard } from './notice-card';
import { TaskRow } from './task-row';

export type BoardTask = {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: IsoDate | null;
  done: boolean;
};

export type BoardHabit = {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  cadence: 'daily' | 'weekly';
  streak: number;
  done: boolean;
};

type BoardState = { tasks: BoardTask[]; habits: BoardHabit[] };

type Toggle =
  | { kind: 'task'; id: string; done: boolean }
  | { kind: 'habit'; id: string; done: boolean };

/**
 * Un único reductor para tareas y hábitos.
 *
 * El XP, la barra y el aviso se derivan de este estado, así que si la escritura
 * falla y React descarta el valor optimista, los tres vuelven atrás a la vez.
 * Con un `useOptimistic` por casilla, revertir dejaría la tarea sin marcar y
 * los puntos sumados.
 */
function reduce(state: BoardState, toggle: Toggle): BoardState {
  if (toggle.kind === 'task') {
    return {
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === toggle.id ? { ...task, done: toggle.done } : task,
      ),
    };
  }

  return {
    ...state,
    habits: state.habits.map((habit) =>
      habit.id === toggle.id
        ? {
            ...habit,
            done: toggle.done,
            // La racha se mueve con la marca para que el aviso de "racha en
            // riesgo" desaparezca en el mismo render en que se marca.
            streak: toggle.done ? habit.streak + 1 : Math.max(0, habit.streak - 1),
          }
        : habit,
    ),
  };
}

export function TodayBoard({
  today,
  tasks,
  habits,
}: {
  today: IsoDate;
  tasks: BoardTask[];
  habits: BoardHabit[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [state, applyToggle] = useOptimistic<BoardState, Toggle>(
    { tasks, habits },
    reduce,
  );

  const xp = dayXp(
    state.tasks.map((task) => ({ priority: task.priority, done: task.done })),
    state.habits.map((habit) => ({ done: habit.done })),
  );

  const overdue = state.tasks.filter(
    (task) => !task.done && task.dueDate !== null && task.dueDate < today,
  );
  const dueToday = state.tasks.filter(
    (task) => !task.done && task.dueDate === today,
  );
  const doneToday = state.tasks.filter((task) => task.done);

  const notice = pickNotice(
    state.habits.map((habit) => ({
      name: habit.name,
      cadence: habit.cadence,
      streak: habit.streak,
      doneToday: habit.done,
    })),
    overdue.map((task) => ({ dueDate: task.dueDate! })),
  );

  function toggleTask(task: BoardTask) {
    setError(null);
    startTransition(async () => {
      applyToggle({ kind: 'task', id: task.id, done: !task.done });
      const result = await setTaskCompleted(task.id, !task.done);
      if (!result.ok) setError(result.error);
    });
  }

  function toggleHabit(habit: BoardHabit) {
    setError(null);
    startTransition(async () => {
      applyToggle({ kind: 'habit', id: habit.id, done: !habit.done });
      const result = await toggleHabitEntry(habit.id, today);
      if (!result.ok) setError(result.error);
    });
  }

  const nothingToDo =
    state.tasks.length === 0 && state.habits.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <NoticeCard notice={notice} />

      <Card tone="feature" className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-caption uppercase text-on-feature-soft">
              Progreso del día
            </span>
            <span className="text-display text-on-feature">
              {xp.earned}
              <span className="text-heading text-on-feature-soft">
                {' '}/ {xp.goal} XP
              </span>
            </span>
          </div>
          <span className="text-title text-positive">{xp.percent}%</span>
        </div>
        <ProgressBar percent={xp.percent} label="Progreso del día" />
      </Card>

      {state.habits.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-caption uppercase text-text-muted">
            Hábitos ({state.habits.filter((habit) => habit.done).length}/
            {state.habits.length})
          </h2>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {state.habits.map((habit) => (
              <HabitChip
                key={habit.id}
                name={habit.name}
                icon={habit.icon}
                color={habit.color}
                done={habit.done}
                streak={habit.streak}
                disabled={pending}
                onToggle={() => toggleHabit(habit)}
              />
            ))}
          </div>
        </section>
      )}

      {overdue.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-caption uppercase text-accent-warm">
            Vencidas ({overdue.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {overdue.map((task) => (
              <TaskRow
                key={task.id}
                {...task}
                overdue
                disabled={pending}
                onToggle={() => toggleTask(task)}
              />
            ))}
          </ul>
        </section>
      )}

      {dueToday.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-caption uppercase text-text-muted">
            Para hoy ({dueToday.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {dueToday.map((task) => (
              <TaskRow
                key={task.id}
                {...task}
                overdue={false}
                disabled={pending}
                onToggle={() => toggleTask(task)}
              />
            ))}
          </ul>
        </section>
      )}

      {doneToday.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-caption uppercase text-text-muted">
            Hechas ({doneToday.length})
          </h2>
          <ul className="flex flex-col gap-2">
            {doneToday.map((task) => (
              <TaskRow
                key={task.id}
                {...task}
                overdue={false}
                disabled={pending}
                onToggle={() => toggleTask(task)}
              />
            ))}
          </ul>
        </section>
      )}

      {nothingToDo && (
        <p className="text-body text-text-muted">
          Nada pendiente para hoy. Usa el botón + para añadir algo.
        </p>
      )}

      {error && <p className="text-label text-accent-warm">{error}</p>}
    </div>
  );
}
```

- [ ] **Paso 5: Exportarlo**

`features/today/index.ts`:

```ts
export { getHomeData, type HomeData } from './queries';
export { TodayBoard } from './components/today-board';
```

- [ ] **Paso 6: Reescribir `app/(app)/inicio/page.tsx`**

```tsx
import { Chip, ProgressBar, SparkIcon } from '@/components/ui';
import { getHomeData, TodayBoard } from '@/features/today';

export default async function InicioPage() {
  const { today, greeting, displayName, dayTasks, habits, level } =
    await getHomeData();

  const name = displayName?.trim();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-display text-text">
              {name ? `${greeting}, ${name}` : greeting}
            </h1>
            <p className="text-label text-text-muted">
              Esto es lo que tienes hoy.
            </p>
          </div>
          <Chip tone="accent" selected className="shrink-0">
            <SparkIcon className="size-4" />
            Nivel {level.level}
          </Chip>
        </div>

        <div className="flex flex-col gap-1.5">
          <ProgressBar
            percent={level.percent}
            label={`Avance al nivel ${level.level + 1}`}
            tone="accent"
            size="sm"
          />
          <p className="text-caption text-text-muted">
            {level.xpIntoLevel} / {level.xpForNextLevel} XP para el nivel{' '}
            {level.level + 1}
          </p>
        </div>
      </header>

      <TodayBoard
        today={today}
        tasks={dayTasks.map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate,
          done: task.completedAt !== null,
        }))}
        habits={habits.map((habit) => ({
          id: habit.id,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          cadence: habit.cadence,
          streak: habit.streak,
          done: habit.doneToday,
        }))}
      />
    </div>
  );
}
```

- [ ] **Paso 7: Poner al día `TaskItem`**

`features/tasks/components/task-item.tsx` sigue usándose en `/tareas` y en
`/proyectos/[id]`. Reemplaza sólo su JSX para que use las primitivas; la lógica
optimista no cambia.

```tsx
'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { CheckBox } from '@/components/ui';
import { formatDayMonth } from '@/lib/dates';
import { setTaskCompleted } from '../actions';
import type { Task } from '../types';

/**
 * Actualización optimista: marcar es la interacción más frecuente de la app y
 * esperar la respuesta del servidor la haría sentir lenta. Si la escritura
 * falla, React revierte el estado optimista al terminar la transición.
 */
export function TaskItem({ task }: { task: Task }) {
  const [pending, startTransition] = useTransition();
  const [optimisticDone, setOptimisticDone] = useOptimistic(
    task.completedAt !== null,
  );
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      const result = await setTaskCompleted(task.id, !optimisticDone);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li className="flex flex-col gap-1 rounded-md border border-border bg-surface-elevated px-4 py-3">
      <div className="flex items-center gap-3">
        <CheckBox
          checked={optimisticDone}
          onToggle={toggle}
          disabled={pending}
          label={`Completar ${task.title}`}
        />
        <span
          className={`min-w-0 flex-1 truncate text-body ${
            optimisticDone ? 'text-text-muted line-through' : 'text-text'
          }`}
        >
          {task.title}
        </span>
        {task.dueDate && (
          <span className="shrink-0 text-caption text-text-muted">
            {formatDayMonth(task.dueDate)}
          </span>
        )}
      </div>
      {error && <p className="text-label text-accent-warm">{error}</p>}
    </li>
  );
}
```

- [ ] **Paso 8: Verificar los números contra la base**

```powershell
npm run dev
```

En `/inicio`, anota lo que se ve: XP ganado, meta, porcentaje y nivel. Después,
herramienta `mcp__claude_ai_Supabase__execute_sql`, `project_id`
`nozxsibtojorqhloxgxq` (sustituye `AAAA-MM-DD` por el "hoy" del usuario):

```sql
select
  count(*) filter (where completed_at is not null) as hechas,
  count(*) as del_pozo,
  sum(case priority
        when 'none' then 20 when 'low' then 40
        when 'medium' then 60 when 'high' then 100 end) as meta_tareas,
  sum(case when completed_at is not null then
        case priority
          when 'none' then 20 when 'low' then 40
          when 'medium' then 60 when 'high' then 100 end
      else 0 end) as ganado_tareas
from public.tasks
where due_date <= 'AAAA-MM-DD';
```

Esperado: `meta_tareas + 50 × (nº de hábitos)` es la meta que enseña la pantalla,
y `ganado_tareas + 50 × (hábitos marcados hoy)` es el XP ganado. Si no cuadran,
**para**: el criterio de éxito 3 dice que ningún número puede ser inventado.

- [ ] **Paso 9: Verificar la reversión optimista**

En DevTools, pestaña Red, activa "Offline". Luego marca una tarea en `/inicio`.

Esperado: la casilla, el XP, la barra, el porcentaje y —si la había— la tarjeta
de aviso cambian de golpe, y al fallar la escritura **los cinco vuelven atrás
juntos** con un mensaje en español debajo. Si vuelve la casilla pero el XP se
queda sumado, el estado optimista está partido en dos y hay que arreglarlo antes
de seguir.

Vuelve a poner la red en línea.

- [ ] **Paso 10: Verificar el aviso**

1. Con al menos un hábito diario con 3 días de racha sin marcar hoy: la tarjeta
   destacada habla de la racha.
2. Márcalo: la tarjeta cambia al aviso de vencidas, o desaparece si no hay.
3. Sin rachas en riesgo y sin vencidas: **no hay tarjeta**, no un hueco vacío.

- [ ] **Paso 11: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 12: Reportar al autor**

**No ejecutes git.** Archivos tocados en las Tareas 20 y 21:

- `lib/dates.ts`
- `lib/__tests__/dates.test.ts`
- `features/profile/queries.ts`
- `features/today/queries.ts`
- `features/today/index.ts`
- `features/today/components/today-board.tsx` (nuevo)
- `features/today/components/notice-card.tsx` (nuevo)
- `features/today/components/habit-chip.tsx` (nuevo)
- `features/today/components/task-row.tsx` (nuevo)
- `app/(app)/inicio/page.tsx`
- `features/tasks/components/task-item.tsx`

Mensaje sugerido: `feat(pulso): pantalla de inicio con XP y aviso derivados`

---

→ Continúa en [06 — Tareas y detalle](06-tareas-y-detalle.md)

# 07 — Hábitos y detalle (Tareas 24–26)

← [06 — Tareas y detalle](06-tareas-y-detalle.md) · → [08 — Progreso, perfil y resto](08-progreso-perfil-y-resto.md)

**Entrega de este archivo:** `/habitos` con la racha global y las tarjetas con
la semana en siete puntos, el formulario completo de edición, y `/habitos/[id]`
con racha, porcentaje del mes, mejor racha y heatmap de cinco semanas.

Lee las **Restricciones globales** del [README](README.md#restricciones-globales).

---

## Tarea 24: `/habitos` con racha global y semana en siete puntos

**Archivos:**
- Reemplazar: `features/habits/components/habit-card.tsx`
- Reemplazar: `app/(app)/habitos/page.tsx`
- Borrar: `features/habits/components/habit-heatmap.tsx`
- Modificar: `features/habits/index.ts`

**Interfaces:**
- Consumes: `listHabitsWithProgress` (Tarea 10); `globalStreak` (Tarea 13);
  `weekDots` (Tarea 13); `toggleHabitEntry`; `Card`, `CheckBox`, `StatTile`,
  `HabitsIcon`, `ChevronRightIcon`.
- Produce: `<HabitCard habit today />` con la piel nueva.

**`HabitHeatmap` se retira.** Su rejilla de 12 semanas la construye ahora
`heatColumns` y la pinta `HeatGrid`, que no conoce el dominio. Mantener las dos
sería tener dos definiciones de la misma rejilla.

- [ ] **Paso 1: Reescribir la tarjeta**

`features/habits/components/habit-card.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import { Card, CheckBox, ChevronRightIcon } from '@/components/ui';
import type { IsoDate } from '@/lib/dates';
import { toggleHabitEntry } from '../actions';
import { weekDots } from '../heatmap';
import type { HabitWithProgress } from '../types';

export function HabitCard({
  habit,
  today,
}: {
  habit: HabitWithProgress;
  today: IsoDate;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticDone, setOptimisticDone] = useOptimistic(habit.doneToday);

  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      const result = await toggleHabitEntry(habit.id, today);
      if (!result.ok) setError(result.error);
    });
  }

  const cadenceLabel =
    habit.cadence === 'daily'
      ? 'Todos los días'
      : `${habit.targetPerWeek} veces por semana`;

  const streakLabel =
    habit.streak === 0
      ? 'Sin racha'
      : habit.cadence === 'daily'
        ? `${habit.streak} ${habit.streak === 1 ? 'día seguido' : 'días seguidos'}`
        : `${habit.streak} ${habit.streak === 1 ? 'semana seguida' : 'semanas seguidas'}`;

  // El punto de hoy refleja la marca optimista; los demás vienen del servidor.
  const dots = weekDots(habit.entryDates, today).map((dot) =>
    dot.isToday ? { ...dot, done: optimisticDone } : dot,
  );

  return (
    <Card as="article" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <CheckBox
          checked={optimisticDone}
          onToggle={toggle}
          disabled={pending}
          color={habit.color}
          shape="circle"
          label={`Marcar ${habit.name} hoy`}
        />
        <span aria-hidden className="text-heading leading-none">
          {habit.icon ?? '•'}
        </span>
        <Link
          href={`/habitos/${habit.id}`}
          className="flex min-w-0 flex-1 items-center gap-2 transition-colors hover:text-accent"
        >
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-heading text-text">{habit.name}</span>
            <span className="text-caption text-text-muted">
              {cadenceLabel} · {streakLabel}
            </span>
          </span>
          <ChevronRightIcon className="ml-auto size-5 shrink-0 text-text-muted" />
        </Link>
      </div>

      <div className="flex justify-between gap-1" role="group" aria-label="Esta semana">
        {dots.map((dot) => (
          <span key={dot.date} className="flex flex-col items-center gap-1.5">
            <span
              title={`${dot.date}: ${dot.done ? 'cumplido' : 'sin marcar'}`}
              className={`size-7 rounded-xl border-2 bg-surface-sunken ${
                dot.isToday ? 'border-current text-accent' : 'border-transparent'
              }`}
              style={{
                backgroundColor: dot.done ? habit.color : undefined,
                opacity: dot.isFuture ? 0.3 : 1,
              }}
            />
            <span className="text-caption text-text-muted">{dot.letter}</span>
          </span>
        ))}
      </div>

      {error && <p className="text-label text-accent-warm">{error}</p>}
    </Card>
  );
}
```

- [ ] **Paso 2: Reescribir la pantalla**

`app/(app)/habitos/page.tsx`:

```tsx
import { HabitsIcon, StatTile } from '@/components/ui';
import { globalStreak } from '@/lib/streaks';
import { getTodayForUser } from '@/features/profile';
import { HabitCard, listHabitsWithProgress } from '@/features/habits';

export default async function HabitosPage() {
  const today = await getTodayForUser();
  const habits = await listHabitsWithProgress(today);

  // La racha global es la misma función de siempre aplicada al conjunto: un día
  // cuenta si se marcó cualquier hábito.
  const streak = globalStreak(
    habits.map((habit) => habit.entryDates),
    today,
  );
  const doneToday = habits.filter((habit) => habit.doneToday).length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display text-text">Hábitos</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          tone="feature"
          value={String(streak)}
          label={streak === 1 ? 'Día de racha' : 'Días de racha'}
          icon={<HabitsIcon className="size-5" />}
        />
        <StatTile
          value={`${doneToday}/${habits.length}`}
          label="Marcados hoy"
        />
      </div>

      {habits.length === 0 ? (
        <p className="text-body text-text-muted">
          Aún no tienes hábitos. Usa el botón + para crear el primero.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} today={today} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Paso 3: Retirar el heatmap viejo**

```powershell
Remove-Item features\habits\components\habit-heatmap.tsx
```

`features/habits/index.ts` — borra la línea:

```ts
export { HabitHeatmap } from './components/habit-heatmap';
```

- [ ] **Paso 4: Verificar a mano**

```powershell
npm run dev
```

En `/habitos`:

1. Arriba, dos fichas: la racha global sobre fondo oscuro y "marcados hoy".
2. Cada tarjeta: casilla circular del color del hábito, su emoji, nombre,
   cadencia · racha, y siete puntos L-M-X-J-V-S-D.
3. Marca un hábito: la casilla y **el punto de hoy** se rellenan a la vez. Los
   días futuros de la semana se ven al 30%.
4. La racha global de la ficha sube tras recargar, no en el mismo instante: se
   calcula en el servidor y llega con la revalidación. Es lo esperado.
5. El nombre lleva a `/habitos/<id>` — 404 hasta la Tarea 26.

- [ ] **Paso 5: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde. Si `typecheck` se queja de `NewHabitForm`, es porque la
página vieja lo importaba: comprueba que la reescribiste entera en el Paso 2.

- [ ] **Paso 6: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `features/habits/components/habit-card.tsx`
- `features/habits/components/habit-heatmap.tsx` (**borrado**)
- `app/(app)/habitos/page.tsx`
- `features/habits/index.ts`

Mensaje sugerido: `feat(pulso): hábitos con racha global y semana en siete puntos`

---

## Tarea 25: Formulario completo de edición

**Archivos:**
- Modificar: `lib/validation.ts`
- Modificar: `lib/__tests__/validation.test.ts`
- Modificar: `features/habits/actions.ts`
- Crear: `features/habits/components/habit-editor.tsx`
- Borrar: `features/habits/components/new-habit-form.tsx`
- Modificar: `features/habits/index.ts`
- Modificar: `features/habits/components/habit-card.tsx` (botón "Editar")

**Interfaces:**
- Produce:
  - `updateHabitSchema` en `lib/validation.ts`
  - `updateHabit(formData: FormData): Promise<ActionResult<void>>`
  - `<HabitEditor habit />` — hoja con nombre, emoji, color, cadencia y meta.

**Por qué existe.** La hoja de captura sólo pide nombre, emoji y cadencia: color
y meta semanal no caben cómodamente ahí. El spec dice que `/habitos` conserva su
formulario completo para editar, y sin una acción de actualización esa frase no
sería cierta. `NewHabitForm` se retira: crear ya se hace en un solo sitio.

- [ ] **Paso 1: Escribir el test que falla**

Añade a `lib/__tests__/validation.test.ts`:

```ts
import { updateHabitSchema } from '@/lib/validation';

describe('updateHabitSchema', () => {
  const base = {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Leer',
    color: '#8B5CF6',
    icon: '📚',
  };

  it('acepta un hábito diario sin meta', () => {
    const parsed = updateHabitSchema.safeParse({ ...base, cadence: 'daily' });
    expect(parsed.success).toBe(true);
  });

  it('exige meta a un hábito semanal', () => {
    const parsed = updateHabitSchema.safeParse({ ...base, cadence: 'weekly' });
    expect(parsed.success).toBe(false);
  });

  it('rechaza meta en un hábito diario', () => {
    const parsed = updateHabitSchema.safeParse({
      ...base,
      cadence: 'daily',
      targetPerWeek: 3,
    });
    expect(parsed.success).toBe(false);
  });

  it('exige un id con forma de uuid', () => {
    const parsed = updateHabitSchema.safeParse({
      ...base,
      id: 'no-soy-un-uuid',
      cadence: 'daily',
    });
    expect(parsed.success).toBe(false);
  });

  it('convierte el emoji vacío en null', () => {
    const parsed = updateHabitSchema.safeParse({
      ...base,
      icon: '',
      cadence: 'daily',
    });
    expect(parsed.success && parsed.data.icon).toBeNull();
  });
});
```

- [ ] **Paso 2: Correr el test y comprobar que falla**

```powershell
npx vitest run lib/__tests__/validation.test.ts
```

Esperado: FAIL — no se exporta `updateHabitSchema`.

- [ ] **Paso 3: Refactorizar los esquemas de hábito**

`lib/validation.ts` — sustituye el bloque de `createHabitSchema` entero por
este, que comparte los campos y la regla entre crear y actualizar:

```ts
const habitFields = {
  name,
  color: color.default('#22C55E'),
  icon,
  cadence: z.enum(['daily', 'weekly']),
  targetPerWeek: z.coerce.number().int().min(1).max(7).nullable().optional(),
};

/**
 * `target_per_week` es obligatorio si y sólo si la cadencia es semanal. La
 * misma regla existe como CHECK en la base; aquí se replica para dar un mensaje
 * en el formulario en lugar de un error 500. Se define una vez y la usan los
 * dos esquemas: si divergieran, crear y editar aceptarían cosas distintas.
 */
const weeklyNeedsTarget = (value: {
  cadence: 'daily' | 'weekly';
  targetPerWeek?: number | null;
}) =>
  value.cadence === 'weekly'
    ? value.targetPerWeek != null
    : value.targetPerWeek == null;

const TARGET_ISSUE = {
  message:
    'Un hábito semanal necesita una meta de 1 a 7; uno diario no lleva meta.',
  path: ['targetPerWeek'],
};

export const createHabitSchema = z
  .object(habitFields)
  .refine(weeklyNeedsTarget, TARGET_ISSUE);

export const updateHabitSchema = z
  .object({ id: z.string().uuid(), ...habitFields })
  .refine(weeklyNeedsTarget, TARGET_ISSUE);
```

Y añade el tipo exportado junto a los demás, al final del archivo:

```ts
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
```

- [ ] **Paso 4: Correr el test y comprobar que pasa**

```powershell
npx vitest run lib/__tests__/validation.test.ts
```

Esperado: PASS, los que ya había más 5.

- [ ] **Paso 5: Escribir la acción**

`features/habits/actions.ts` — añade el import del esquema nuevo:

```ts
import { createHabitSchema, updateHabitSchema } from '@/lib/validation';
```

Y añade la acción después de `createHabit`:

```ts
export async function updateHabit(
  formData: FormData,
): Promise<ActionResult<void>> {
  const cadence = formData.get('cadence');
  const rawTarget = formData.get('targetPerWeek');

  const parsed = updateHabitSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    color: formData.get('color') ?? undefined,
    icon: formData.get('icon') ?? undefined,
    cadence,
    targetPerWeek: cadence === 'weekly' && rawTarget ? rawTarget : null,
  });
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const supabase = await createClient();

  // RLS ya impide tocar el hábito de otro; no hace falta un .eq('user_id', …).
  const { error } = await supabase
    .from('habits')
    .update({
      name: parsed.data.name,
      color: parsed.data.color,
      icon: parsed.data.icon,
      cadence: parsed.data.cadence,
      target_per_week: parsed.data.targetPerWeek ?? null,
    })
    .eq('id', parsed.data.id);

  if (error) return fail(messageForDbError(error.code));

  revalidateHabitViews();
  return ok();
}
```

- [ ] **Paso 6: Escribir el editor**

`features/habits/components/habit-editor.tsx`:

```tsx
'use client';

import { useState, useTransition } from 'react';
import { Chip, Sheet } from '@/components/ui';
import { updateHabit } from '../actions';
import type { Habit } from '../types';

export function HabitEditor({
  habit,
  open,
  onClose,
}: {
  habit: Habit;
  open: boolean;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState(habit.icon ?? '');
  const [color, setColor] = useState(habit.color);
  const [cadence, setCadence] = useState(habit.cadence);
  const [targetPerWeek, setTargetPerWeek] = useState(habit.targetPerWeek ?? 3);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.set('id', habit.id);
    formData.set('name', name);
    formData.set('icon', icon);
    formData.set('color', color);
    formData.set('cadence', cadence);
    if (cadence === 'weekly') formData.set('targetPerWeek', String(targetPerWeek));

    startTransition(async () => {
      const result = await updateHabit(formData);
      if (result.ok) {
        onClose();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title="Editar hábito">
      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex gap-3">
          <input
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            maxLength={8}
            placeholder="🙂"
            aria-label="Emoji del hábito"
            className="w-16 shrink-0 rounded-md border border-border bg-surface px-3 py-3 text-center text-body outline-none focus:border-accent"
          />
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            data-autofocus
            aria-label="Nombre del hábito"
            className="min-w-0 flex-1 rounded-md border border-border bg-surface px-4 py-3 text-body text-text outline-none focus:border-accent"
          />
        </div>

        <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-elevated px-4 py-3">
          <span className="text-label text-text">Color</span>
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            aria-label="Color del hábito"
            className="h-9 w-14 rounded-xs border border-border bg-transparent"
          />
        </label>

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

        {error && <p className="text-label text-accent-warm">{error}</p>}

        <button
          type="submit"
          disabled={pending || name.trim() === ''}
          className="bg-brand-gradient w-full rounded-md py-3.5 text-label text-white shadow-glow transition-opacity disabled:opacity-40"
        >
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>
    </Sheet>
  );
}
```

- [ ] **Paso 7: Abrirlo desde la tarjeta**

`features/habits/components/habit-card.tsx` — añade `IconButton` y `PencilIcon`
al import de `@/components/ui`, y el editor:

```tsx
import { HabitEditor } from './habit-editor';
```

Añade el estado junto a los demás:

```tsx
  const [editing, setEditing] = useState(false);
```

Sustituye el `<ChevronRightIcon …>` por el botón de edición fuera del enlace —el
chevron se queda dentro del `<Link>` y el lápiz al lado. Reemplaza el cierre del
`<Link>` y añade después:

```tsx
        </Link>
        <IconButton
          label={`Editar ${habit.name}`}
          tone="ghost"
          onClick={() => setEditing(true)}
        >
          <PencilIcon className="size-5" />
        </IconButton>
```

Y antes de cerrar `</Card>`:

```tsx
      <HabitEditor
        habit={habit}
        open={editing}
        onClose={() => setEditing(false)}
      />
```

- [ ] **Paso 8: Retirar el formulario de creación**

```powershell
Remove-Item features\habits\components\new-habit-form.tsx
```

`features/habits/index.ts` — sustituye la línea de `NewHabitForm`:

```ts
export { HabitEditor } from './components/habit-editor';
```

Y añade `updateHabit` a la línea de acciones:

```ts
export { createHabit, updateHabit, toggleHabitEntry } from './actions';
```

- [ ] **Paso 9: Verificar a mano**

```powershell
npm run dev
```

En `/habitos`:

1. Cada tarjeta tiene un botón de edición. Ábrelo: la hoja trae el nombre, el
   emoji, el color y la cadencia **ya rellenos** con los valores del hábito.
2. Cambia el color y guarda: la casilla circular y los puntos de la semana pasan
   al color nuevo.
3. Cambia a "Veces por semana" con meta 3 y guarda: la línea de cadencia dice
   "3 veces por semana" y la racha se recalcula con la regla semanal.
4. Vuelve a "Todos los días" y guarda: no aparece error de `CHECK`; la meta se
   manda como `null`.
5. Borra el nombre: el botón se deshabilita.

- [ ] **Paso 10: Comprobar contra la base**

Herramienta: `mcp__claude_ai_Supabase__execute_sql`, `project_id`
`nozxsibtojorqhloxgxq`:

```sql
select name, icon, color, cadence, target_per_week
from public.habits
where archived_at is null
order by updated_at desc
limit 5;
```

Esperado: la fila que editaste refleja los valores nuevos, y
`target_per_week` es `null` en los diarios.

- [ ] **Paso 11: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 12: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `lib/validation.ts`
- `lib/__tests__/validation.test.ts`
- `features/habits/actions.ts`
- `features/habits/components/habit-editor.tsx` (nuevo)
- `features/habits/components/habit-card.tsx`
- `features/habits/components/new-habit-form.tsx` (**borrado**)
- `features/habits/index.ts`

Mensaje sugerido: `feat(pulso): edición completa de hábitos desde la hoja`

---

## Tarea 26: `/habitos/[id]`

**Archivos:**
- Crear: `app/(app)/habitos/[id]/page.tsx`
- Crear: `features/habits/components/habit-detail.tsx`
- Modificar: `features/habits/index.ts`

**Interfaces:**
- Consumes: `getHabitById` (Tarea 16); `bestStreak`, `monthlyCompletion`
  (Tarea 13); `heatColumns` (Tarea 13); `HeatGrid`, `StatTile`, `Card`,
  `ChevronLeftIcon` (Tareas 4–9); `toggleHabitEntry`.
- Produce: `<HabitDetail habit today bestStreak monthPercent columns />` — recibe
  **todo ya calculado**; la vista no deriva nada.

**Cinco semanas y no doce.** Es lo que pide el spec para esta pantalla; la
ventana de datos sigue siendo de 84 días porque la mejor racha se mide sobre
todo el histórico traído.

- [ ] **Paso 1: Escribir la vista**

`features/habits/components/habit-detail.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useOptimistic, useState, useTransition } from 'react';
import {
  Card,
  ChevronLeftIcon,
  HabitsIcon,
  HeatGrid,
  StatTile,
  type HeatColumn,
} from '@/components/ui';
import type { IsoDate } from '@/lib/dates';
import { toggleHabitEntry } from '../actions';
import type { HabitWithProgress } from '../types';

export function HabitDetail({
  habit,
  today,
  best,
  monthPercent,
  columns,
}: {
  habit: HabitWithProgress;
  today: IsoDate;
  best: number;
  monthPercent: number;
  columns: HeatColumn[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticDone, setOptimisticDone] = useOptimistic(habit.doneToday);

  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      const result = await toggleHabitEntry(habit.id, today);
      if (!result.ok) setError(result.error);
    });
  }

  const unit = habit.cadence === 'daily' ? 'días' : 'semanas';

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/habitos"
        className="flex items-center gap-1 text-label text-text-soft transition-colors hover:text-accent"
      >
        <ChevronLeftIcon className="size-5" />
        Hábitos
      </Link>

      <header className="flex items-center gap-3">
        <span aria-hidden className="text-display leading-none">
          {habit.icon ?? '•'}
        </span>
        <div className="flex flex-col">
          <h1 className="text-title text-text">{habit.name}</h1>
          <p className="text-label text-text-muted">
            {habit.cadence === 'daily'
              ? 'Todos los días'
              : `${habit.targetPerWeek} veces por semana`}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatTile
          tone="feature"
          value={String(habit.streak)}
          label={`Racha (${unit})`}
          icon={<HabitsIcon className="size-5" />}
        />
        <StatTile value={`${monthPercent}%`} label="Este mes" />
        <StatTile value={String(best)} label={`Mejor (${unit})`} />
      </div>

      <Card className="flex flex-col gap-3">
        <h2 className="text-caption uppercase text-text-muted">
          Últimas cinco semanas
        </h2>
        <HeatGrid
          columns={columns}
          color={habit.color}
          caption="Últimas cinco semanas"
        />
      </Card>

      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={optimisticDone}
        className={`w-full rounded-md py-3.5 text-label transition-opacity disabled:opacity-40 ${
          optimisticDone
            ? 'border border-border bg-surface-elevated text-text-soft'
            : 'bg-brand-gradient text-white shadow-glow'
        }`}
      >
        {optimisticDone ? 'Marcado hoy · deshacer' : 'Marcar hoy'}
      </button>

      {error && <p className="text-label text-accent-warm">{error}</p>}
    </div>
  );
}
```

- [ ] **Paso 2: Escribir la página**

`app/(app)/habitos/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { bestStreak, monthlyCompletion, type Cadence } from '@/lib/streaks';
import { getTodayForUser } from '@/features/profile';
import { getHabitById, HabitDetail, heatColumns } from '@/features/habits';

const HEATMAP_WEEKS = 5;

export default async function HabitoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const today = await getTodayForUser();
  const habit = await getHabitById(id, today);

  if (!habit) notFound();

  const cadence: Cadence =
    habit.cadence === 'daily'
      ? { type: 'daily' }
      : { type: 'weekly', targetPerWeek: habit.targetPerWeek! };

  // Todo se calcula aquí: la vista recibe números y no deriva nada.
  return (
    <HabitDetail
      habit={habit}
      today={today}
      best={bestStreak(habit.entryDates, cadence, today)}
      monthPercent={monthlyCompletion(habit.entryDates, cadence, today)}
      columns={heatColumns(habit.entryDates, today, HEATMAP_WEEKS)}
    />
  );
}
```

- [ ] **Paso 3: Exportar la vista y dejar el barril completo**

`features/habits/index.ts` queda así, ya definitivo para este bloque:

```ts
export type { Habit, HabitWithProgress } from './types';
export { listHabitsWithProgress, getHabitById } from './queries';
export { createHabit, updateHabit, toggleHabitEntry } from './actions';
export { heatColumns, weekDots, type WeekDot } from './heatmap';
export { HabitCard } from './components/habit-card';
export { HabitEditor } from './components/habit-editor';
export { HabitDetail } from './components/habit-detail';
```

- [ ] **Paso 4: Verificar a mano**

```powershell
npm run dev
```

Desde `/habitos`, pulsa el nombre de un hábito:

1. Cabecera con emoji, nombre y cadencia; enlace "‹ Hábitos" arriba.
2. Tres fichas: racha (sobre fondo oscuro), porcentaje del mes y mejor racha.
3. Rejilla de 5 columnas × 7 filas. Los días posteriores a hoy se ven al 35%.
4. Botón grande: en gradiente si no está marcado, apagado si sí.
5. Púlsalo: cambia de estado y la última celda de la rejilla se rellena tras la
   revalidación.
6. Un id inventado da 404, no un 500.

- [ ] **Paso 5: Comprobar los números contra la base**

Herramienta: `mcp__claude_ai_Supabase__execute_sql`, `project_id`
`nozxsibtojorqhloxgxq` (sustituye `<ID>` y el mes):

```sql
select count(*) as marcas_del_mes
from public.habit_entries
where habit_id = '<ID>'
  and to_char(entry_date, 'YYYY-MM') = 'AAAA-MM';
```

Esperado: para un hábito diario, `marcas_del_mes / día_de_hoy × 100`, redondeado,
es exactamente el porcentaje que enseña la ficha "Este mes".

- [ ] **Paso 6: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 7: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `app/(app)/habitos/[id]/page.tsx` (nuevo)
- `features/habits/components/habit-detail.tsx` (nuevo)
- `features/habits/index.ts`

Mensaje sugerido: `feat(pulso): detalle de hábito con mejor racha y heatmap`

---

→ Continúa en [08 — Progreso, perfil y resto](08-progreso-perfil-y-resto.md)

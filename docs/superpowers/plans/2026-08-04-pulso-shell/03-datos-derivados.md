# 03 — Datos derivados (Tareas 10–16)

← [02 — Primitivas UI](02-primitivas-ui.md) · → [04 — Shell, navegación y captura](04-shell-navegacion-y-captura.md)

**Entrega de este archivo:** el único cambio de esquema del bloque, cuatro
módulos puros con tests y las consultas que las pantallas necesitarán. Al
terminar, todo lo que las pantallas van a pintar existe y está probado, aunque
todavía no se vea.

Lee las **Restricciones globales** del [README](README.md#restricciones-globales).
En especial: **el XP nunca se almacena** y **la racha nunca se almacena**.

---

## Tarea 10: Columna `habits.icon`

**Archivos:**
- Crear: `migrations/0004_habits_icon.sql` *(fuera de git, por `.gitignore`)*
- Modificar: `migrations/README.md`
- Modificar: `lib/supabase/database.types.ts` (regenerado)
- Modificar: `features/habits/types.ts`
- Modificar: `features/habits/queries.ts`
- Modificar: `lib/validation.ts`
- Modificar: `features/habits/actions.ts`

**Interfaces:**
- Produce: `Habit.icon: string | null`, presente en `listHabitsWithProgress` y
  aceptado por `createHabit` bajo el campo de formulario `icon`.

**Es el único cambio de esquema permitido en este bloque.** Cualquier otro se
consulta con el autor antes de tocar nada.

- [ ] **Paso 1: Aplicar la migración por el MCP de Supabase**

Herramienta: `mcp__claude_ai_Supabase__apply_migration`
- `project_id`: `nozxsibtojorqhloxgxq`
- `name`: `0004_habits_icon`
- `query`:

```sql
alter table public.habits add column icon text;

comment on column public.habits.icon is
  'Emoji del hábito. Anulable: los hábitos creados antes del rediseño no lo tienen.';
```

- [ ] **Paso 2: Verificar que la columna existe**

Herramienta: `mcp__claude_ai_Supabase__execute_sql`, `project_id`
`nozxsibtojorqhloxgxq`:

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'habits' and column_name = 'icon';
```

Esperado: una fila — `icon | text | YES`. Si vienen cero filas, la migración no
se aplicó: **no sigas**.

- [ ] **Paso 3: Guardar el script local**

`migrations/0004_habits_icon.sql`, con exactamente el mismo SQL que se ejecutó:

```sql
-- 0004_habits_icon.sql
-- Emoji del hábito. Sin él, las tarjetas y los chips de hábito pierden su
-- elemento visual principal y el rediseño de Pulso se cae.

alter table public.habits add column icon text;

comment on column public.habits.icon is
  'Emoji del hábito. Anulable: los hábitos creados antes del rediseño no lo tienen.';
```

Un `migrations/` que no coincide con la base es peor que no tenerlo.

- [ ] **Paso 4: Documentarlo en `migrations/README.md`**

En la tabla de la sección `## Orden`, añade una fila después de la de `0003`:

```markdown
| 0004 | `0004_habits_icon.sql` | Columna `icon` (emoji) en `habits`, para Pulso |
```

Y en la sección `## Decisiones que no son obvias al leer el SQL`, añade al
final:

```markdown
- **`habits.icon` es anulable y sin `CHECK`.** Es un emoji que elige el usuario;
  validarlo en la base exigiría una expresión regular de rangos Unicode que se
  queda vieja con cada versión del estándar. El límite de longitud lo pone Zod
  en `lib/validation.ts`, donde se puede corregir sin migrar.
```

- [ ] **Paso 5: Regenerar los tipos de la base**

Herramienta: `mcp__claude_ai_Supabase__generate_typescript_types`, `project_id`
`nozxsibtojorqhloxgxq`. Escribe el resultado completo en
`lib/supabase/database.types.ts`, reemplazando el archivo.

Comprueba que `habits.Row` ahora incluye `icon: string | null`.

- [ ] **Paso 6: Añadir `icon` al tipo de dominio**

`features/habits/types.ts` — reemplaza el bloque `Habit`:

```ts
export type Habit = {
  id: string;
  name: string;
  color: string;
  /** Emoji. Anulable: los hábitos anteriores al rediseño no lo tienen. */
  icon: string | null;
  cadence: 'daily' | 'weekly';
  targetPerWeek: number | null;
};
```

- [ ] **Paso 7: Traerlo en la consulta**

`features/habits/queries.ts` — en `listHabitsWithProgress`, cambia el `select`:

```ts
    .select('id, name, color, icon, cadence, target_per_week')
```

Y dentro del `habitRows.map`, añade `icon` al objeto `habit`:

```ts
    const habit: Habit = {
      id: row.id,
      name: row.name,
      color: row.color,
      icon: row.icon,
      cadence: row.cadence,
      targetPerWeek: row.target_per_week,
    };
```

- [ ] **Paso 8: Validarlo**

`lib/validation.ts` — añade el campo después de la constante `color`:

```ts
/** Un emoji compuesto (bandera, familia, tono de piel) puede ocupar varios
 *  puntos de código; 8 caracteres cubren los que existen sin dejar meter una
 *  frase en el hueco del icono. */
const icon = z
  .string()
  .trim()
  .max(8, 'El emoji no puede pasar de 8 caracteres')
  .nullable()
  .optional()
  .transform((value) => (value ? value : null));
```

Y añádelo al objeto de `createHabitSchema`, después de `color`:

```ts
    icon,
```

- [ ] **Paso 9: Aceptarlo en la acción**

`features/habits/actions.ts` — en `createHabit`, dentro del `safeParse`, añade
después de la línea de `color`:

```ts
    icon: formData.get('icon') ?? undefined,
```

Y en el `insert`, después de `color`:

```ts
    icon: parsed.data.icon,
```

- [ ] **Paso 10: Verificar**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }
```

Esperado: todo verde. Los tests existentes de `lib/__tests__/validation.test.ts`
siguen pasando porque `icon` es opcional.

- [ ] **Paso 11: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `migrations/0004_habits_icon.sql` (nuevo, **no va a git**)
- `migrations/README.md` (**no va a git**)
- `lib/supabase/database.types.ts`
- `features/habits/types.ts`
- `features/habits/queries.ts`
- `lib/validation.ts`
- `features/habits/actions.ts`

Mensaje sugerido: `feat(pulso): columna icon en habits`

---

## Tarea 11: `lib/xp.ts`

**Archivos:**
- Crear: `lib/xp.ts`
- Crear: `lib/__tests__/xp.test.ts`

**Interfaces:**
- Produce:
  - `type XpPriority = 'none' | 'low' | 'medium' | 'high'`
  - `XP_BY_PRIORITY: Record<XpPriority, number>` — `none` 20, `low` 40, `medium` 60, `high` 100
  - `XP_PER_HABIT = 50`
  - `xpForTask(priority: XpPriority): number`
  - `type DayTask = { priority: XpPriority; done: boolean }`
  - `type DayHabit = { done: boolean }`
  - `type DayXp = { earned: number; goal: number; percent: number }`
  - `dayXp(tasks: DayTask[], habits: DayHabit[]): DayXp`
  - `lifetimeXp(completedByPriority: Record<XpPriority, number>, habitEntries: number): number`
  - `type LevelInfo = { level: number; xpIntoLevel: number; xpForNextLevel: number; percent: number }`
  - `levelFromXp(totalXp: number): LevelInfo`
  - `type DayPoint = { date: IsoDate; xp: number }`
  - `weeklyXp(completions: { date: IsoDate; priority: XpPriority }[], habitEntryDates: IsoDate[], today: IsoDate): DayPoint[]`
- Consumido por: `dayXp` y `weeklyXp` desde el cliente (la Tarea 21 los llama
  sobre estado optimista), así que **este módulo no importa `server-only`**.

**Decisiones que fija esta tarea:**

- La meta del día es **todo el XP disponible hoy**: tareas con fecha de hoy o
  vencidas, más los hábitos del día. Completarlo todo llena la barra. La meta
  fija de 1.800 XP del prototipo sólo funciona con datos falsos: un martes con
  dos tareas dejaría la barra en el 12%.
- El nivel usa umbrales cuadráticos: `umbral(n) = 500 · (n−1)²`. Nivel 2 a los
  500, nivel 3 a los 2.000, nivel 5 a los 8.000. Lineal haría que subir de nivel
  dejara de significar nada; exponencial lo haría inalcanzable.

- [ ] **Paso 1: Escribir el test que falla**

`lib/__tests__/xp.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import {
  dayXp,
  levelFromXp,
  lifetimeXp,
  weeklyXp,
  XP_PER_HABIT,
  xpForTask,
} from '@/lib/xp';

describe('xpForTask', () => {
  it('sale de la prioridad y no de una columna', () => {
    expect(xpForTask('none')).toBe(20);
    expect(xpForTask('low')).toBe(40);
    expect(xpForTask('medium')).toBe(60);
    expect(xpForTask('high')).toBe(100);
  });
});

describe('dayXp', () => {
  it('la meta es todo el XP disponible hoy, tareas y hábitos', () => {
    const result = dayXp(
      [
        { priority: 'high', done: true },
        { priority: 'low', done: false },
      ],
      [{ done: true }, { done: false }],
    );

    expect(result.goal).toBe(100 + 40 + XP_PER_HABIT * 2);
    expect(result.earned).toBe(100 + XP_PER_HABIT);
    expect(result.percent).toBe(63);
  });

  it('completarlo todo llena la barra', () => {
    const result = dayXp([{ priority: 'medium', done: true }], [{ done: true }]);

    expect(result.earned).toBe(result.goal);
    expect(result.percent).toBe(100);
  });

  it('un día sin nada pendiente no divide por cero', () => {
    expect(dayXp([], [])).toEqual({ earned: 0, goal: 0, percent: 0 });
  });

  it('cuenta las tareas vencidas dentro de la meta', () => {
    // Quien las llama ya filtró a "vencidas o de hoy": aquí sólo se suman.
    const result = dayXp(
      [
        { priority: 'none', done: false },
        { priority: 'none', done: false },
        { priority: 'none', done: true },
      ],
      [],
    );

    expect(result.goal).toBe(60);
    expect(result.earned).toBe(20);
    expect(result.percent).toBe(33);
  });
});

describe('lifetimeXp', () => {
  it('suma tareas completadas por prioridad más los hábitos marcados', () => {
    const total = lifetimeXp(
      { none: 3, low: 2, medium: 1, high: 4 },
      10,
    );

    expect(total).toBe(3 * 20 + 2 * 40 + 1 * 60 + 4 * 100 + 10 * 50);
  });
});

describe('levelFromXp', () => {
  it('arranca en el nivel 1 con la barra vacía', () => {
    expect(levelFromXp(0)).toEqual({
      level: 1,
      xpIntoLevel: 0,
      xpForNextLevel: 500,
      percent: 0,
    });
  });

  it('sube de nivel justo en el umbral', () => {
    expect(levelFromXp(499).level).toBe(1);
    expect(levelFromXp(500).level).toBe(2);
    expect(levelFromXp(1999).level).toBe(2);
    expect(levelFromXp(2000).level).toBe(3);
    expect(levelFromXp(8000).level).toBe(5);
  });

  it('describe el avance dentro del nivel en curso', () => {
    expect(levelFromXp(1250)).toEqual({
      level: 2,
      xpIntoLevel: 750,
      xpForNextLevel: 1500,
      percent: 50,
    });
  });

  it('no se rompe con un total negativo', () => {
    expect(levelFromXp(-40).level).toBe(1);
  });
});

describe('weeklyXp', () => {
  it('devuelve siete días en orden, del más viejo a hoy', () => {
    const points = weeklyXp([], [], '2026-08-04');

    expect(points).toHaveLength(7);
    expect(points[0].date).toBe('2026-07-29');
    expect(points[6].date).toBe('2026-08-04');
  });

  it('suma tareas y hábitos en el día que les toca', () => {
    const points = weeklyXp(
      [
        { date: '2026-08-04', priority: 'high' },
        { date: '2026-08-04', priority: 'low' },
        { date: '2026-08-01', priority: 'none' },
      ],
      ['2026-08-04', '2026-07-30'],
      '2026-08-04',
    );

    const byDate = Object.fromEntries(points.map((p) => [p.date, p.xp]));

    expect(byDate['2026-08-04']).toBe(100 + 40 + 50);
    expect(byDate['2026-08-01']).toBe(20);
    expect(byDate['2026-07-30']).toBe(50);
    expect(byDate['2026-07-31']).toBe(0);
  });

  it('ignora lo que cae fuera de la ventana de siete días', () => {
    const points = weeklyXp(
      [{ date: '2026-07-20', priority: 'high' }],
      ['2026-07-20'],
      '2026-08-04',
    );

    expect(points.every((point) => point.xp === 0)).toBe(true);
  });
});
```

- [ ] **Paso 2: Correr el test y comprobar que falla**

```powershell
npx vitest run lib/__tests__/xp.test.ts
```

Esperado: FAIL — `Failed to resolve import "@/lib/xp"`.

- [ ] **Paso 3: Escribir `lib/xp.ts`**

```ts
import { addDays, type IsoDate } from './dates';

/**
 * XP derivado, nunca almacenado.
 *
 * Igual que la racha, el XP de este bloque sale de las tareas completadas y de
 * `habit_entries`. El saldo acumulado que no se pierde es estado guardado y
 * pertenece al bloque 4.
 *
 * Este módulo no importa `server-only`: la pantalla de Inicio lo llama también
 * en el cliente, sobre estado optimista, para que revertir una casilla revierta
 * los puntos y la barra en el mismo render.
 */
export type XpPriority = 'none' | 'low' | 'medium' | 'high';

/** Los números salen de la prioridad y no de una columna. */
export const XP_BY_PRIORITY: Record<XpPriority, number> = {
  none: 20,
  low: 40,
  medium: 60,
  high: 100,
};

export const XP_PER_HABIT = 50;

/** `umbral(n) = LEVEL_STEP · (n−1)²`. */
const LEVEL_STEP = 500;

export function xpForTask(priority: XpPriority): number {
  return XP_BY_PRIORITY[priority];
}

export type DayTask = { priority: XpPriority; done: boolean };
export type DayHabit = { done: boolean };
export type DayXp = { earned: number; goal: number; percent: number };

/**
 * XP del día y meta del día.
 *
 * La meta es **todo el XP disponible hoy**. Quien llama ya filtró: las tareas
 * son las de hoy y las vencidas, los hábitos son los que tocan hoy. Aquí sólo
 * se suma, para que la misma función sirva en servidor y en cliente.
 */
export function dayXp(tasks: DayTask[], habits: DayHabit[]): DayXp {
  let earned = 0;
  let goal = 0;

  for (const task of tasks) {
    const value = xpForTask(task.priority);
    goal += value;
    if (task.done) earned += value;
  }

  for (const habit of habits) {
    goal += XP_PER_HABIT;
    if (habit.done) earned += XP_PER_HABIT;
  }

  // Un día sin nada pendiente da meta cero: sin esto la barra dividiría por
  // cero y mostraría NaN justo el día que no había nada que reprochar.
  const percent = goal === 0 ? 0 : Math.round((earned / goal) * 100);

  return { earned, goal, percent };
}

export function lifetimeXp(
  completedByPriority: Record<XpPriority, number>,
  habitEntries: number,
): number {
  const fromTasks = (Object.keys(XP_BY_PRIORITY) as XpPriority[]).reduce(
    (total, priority) =>
      total + completedByPriority[priority] * XP_BY_PRIORITY[priority],
    0,
  );

  return fromTasks + habitEntries * XP_PER_HABIT;
}

export type LevelInfo = {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  percent: number;
};

/**
 * Nivel a partir del XP histórico acumulado.
 *
 * Umbrales cuadráticos: lineal haría que subir de nivel dejara de significar
 * algo al tercer mes; exponencial lo volvería inalcanzable.
 */
export function levelFromXp(totalXp: number): LevelInfo {
  const total = Math.max(0, totalXp);
  const level = Math.floor(Math.sqrt(total / LEVEL_STEP)) + 1;

  const floorXp = LEVEL_STEP * (level - 1) ** 2;
  const xpForNextLevel = LEVEL_STEP * (2 * level - 1);
  const xpIntoLevel = total - floorXp;

  return {
    level,
    xpIntoLevel,
    xpForNextLevel,
    percent: Math.round((xpIntoLevel / xpForNextLevel) * 100),
  };
}

export type DayPoint = { date: IsoDate; xp: number };

/**
 * XP de cada uno de los últimos siete días, del más viejo a hoy.
 *
 * Las fechas de las tareas completadas llegan ya convertidas al día local del
 * usuario: `completed_at` es un instante con zona y quien consulta es el único
 * que conoce la zona del perfil.
 */
export function weeklyXp(
  completions: { date: IsoDate; priority: XpPriority }[],
  habitEntryDates: IsoDate[],
  today: IsoDate,
): DayPoint[] {
  const xpByDate = new Map<IsoDate, number>();

  const add = (date: IsoDate, amount: number) =>
    xpByDate.set(date, (xpByDate.get(date) ?? 0) + amount);

  for (const completion of completions) {
    add(completion.date, xpForTask(completion.priority));
  }
  for (const date of habitEntryDates) {
    add(date, XP_PER_HABIT);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    return { date, xp: xpByDate.get(date) ?? 0 };
  });
}
```

- [ ] **Paso 4: Correr el test y comprobar que pasa**

```powershell
npx vitest run lib/__tests__/xp.test.ts
```

Esperado: PASS, 12 tests.

- [ ] **Paso 5: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `lib/xp.ts` (nuevo)
- `lib/__tests__/xp.test.ts` (nuevo)

Mensaje sugerido: `feat(pulso): XP derivado, meta del día y nivel`

---

## Tarea 12: `lib/notice.ts`

**Archivos:**
- Crear: `lib/notice.ts`
- Crear: `lib/__tests__/notice.test.ts`

**Interfaces:**
- Produce:
  - `STREAK_AT_RISK_THRESHOLD = 3`
  - `type NoticeHabit = { name: string; cadence: 'daily' | 'weekly'; streak: number; doneToday: boolean }`
  - `type NoticeTask = { dueDate: IsoDate }`
  - `type Notice = { kind: 'streak-at-risk'; habitName: string; streak: number } | { kind: 'overdue-tasks'; count: number; oldestDueDate: IsoDate } | null`
  - `pickNotice(habits: NoticeHabit[], overdue: NoticeTask[]): Notice`
- Consumido desde el cliente igual que `lib/xp.ts`: **sin `server-only`**.

**Lectura del spec que fija esta tarea.** "Una racha en riesgo — hábito con tres
días o más sin marcar hoy" se implementa como **racha de 3 o más días que
todavía no se ha marcado hoy**: es lo que hay que perder. Los hábitos semanales
quedan fuera: una racha semanal no se pierde por no marcar hoy.

- [ ] **Paso 1: Escribir el test que falla**

`lib/__tests__/notice.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { pickNotice, STREAK_AT_RISK_THRESHOLD } from '@/lib/notice';

const habit = (over: Partial<Parameters<typeof pickNotice>[0][number]> = {}) => ({
  name: 'Leer',
  cadence: 'daily' as const,
  streak: 0,
  doneToday: false,
  ...over,
});

describe('pickNotice', () => {
  it('avisa de la racha en riesgo a partir del umbral', () => {
    expect(STREAK_AT_RISK_THRESHOLD).toBe(3);

    expect(pickNotice([habit({ streak: 3 })], [])).toEqual({
      kind: 'streak-at-risk',
      habitName: 'Leer',
      streak: 3,
    });
  });

  it('no avisa por debajo del umbral', () => {
    expect(pickNotice([habit({ streak: 2 })], [])).toBeNull();
  });

  it('no avisa de un hábito que ya se marcó hoy', () => {
    expect(pickNotice([habit({ streak: 9, doneToday: true })], [])).toBeNull();
  });

  it('ignora los hábitos semanales: su racha no se pierde hoy', () => {
    expect(
      pickNotice([habit({ cadence: 'weekly', streak: 6 })], []),
    ).toBeNull();
  });

  it('elige la racha más larga cuando hay varias en riesgo', () => {
    const notice = pickNotice(
      [habit({ name: 'Leer', streak: 4 }), habit({ name: 'Correr', streak: 11 })],
      [],
    );

    expect(notice).toEqual({
      kind: 'streak-at-risk',
      habitName: 'Correr',
      streak: 11,
    });
  });

  it('la racha en riesgo gana a las tareas vencidas', () => {
    const notice = pickNotice(
      [habit({ streak: 5 })],
      [{ dueDate: '2026-07-01' }, { dueDate: '2026-07-02' }],
    );

    expect(notice?.kind).toBe('streak-at-risk');
  });

  it('sin rachas en riesgo, avisa de las vencidas y de la más vieja', () => {
    expect(
      pickNotice([], [{ dueDate: '2026-07-30' }, { dueDate: '2026-07-02' }]),
    ).toEqual({
      kind: 'overdue-tasks',
      count: 2,
      oldestDueDate: '2026-07-02',
    });
  });

  it('sin nada que decir, no hay aviso y la tarjeta no se pinta', () => {
    expect(pickNotice([], [])).toBeNull();
  });
});
```

- [ ] **Paso 2: Correr el test y comprobar que falla**

```powershell
npx vitest run lib/__tests__/notice.test.ts
```

Esperado: FAIL — `Failed to resolve import "@/lib/notice"`.

- [ ] **Paso 3: Escribir `lib/notice.ts`**

```ts
import type { IsoDate } from './dates';

/**
 * Decide el aviso de la tarjeta destacada de Inicio.
 *
 * En el prototipo ese espacio lo ocupa un mensaje de IA inventado. Se conserva
 * el tratamiento visual y se llena con información real y accionable.
 */
export const STREAK_AT_RISK_THRESHOLD = 3;

export type NoticeHabit = {
  name: string;
  cadence: 'daily' | 'weekly';
  streak: number;
  doneToday: boolean;
};

export type NoticeTask = { dueDate: IsoDate };

export type Notice =
  | { kind: 'streak-at-risk'; habitName: string; streak: number }
  | { kind: 'overdue-tasks'; count: number; oldestDueDate: IsoDate }
  | null;

export function pickNotice(
  habits: NoticeHabit[],
  overdue: NoticeTask[],
): Notice {
  // 1. Una racha en riesgo. Sólo las diarias: la racha de un hábito semanal no
  //    se pierde por no marcar hoy, así que avisar de ella sería mentir.
  const atRisk = habits
    .filter(
      (habit) =>
        habit.cadence === 'daily' &&
        !habit.doneToday &&
        habit.streak >= STREAK_AT_RISK_THRESHOLD,
    )
    .sort((a, b) => b.streak - a.streak);

  if (atRisk.length > 0) {
    return {
      kind: 'streak-at-risk',
      habitName: atRisk[0].name,
      streak: atRisk[0].streak,
    };
  }

  // 2. Tareas vencidas arrastradas.
  if (overdue.length > 0) {
    const oldestDueDate = overdue.reduce(
      (oldest, task) => (task.dueDate < oldest ? task.dueDate : oldest),
      overdue[0].dueDate,
    );

    return { kind: 'overdue-tasks', count: overdue.length, oldestDueDate };
  }

  // 3. Si no hay nada que decir, la tarjeta no se pinta.
  return null;
}
```

- [ ] **Paso 4: Correr el test y comprobar que pasa**

```powershell
npx vitest run lib/__tests__/notice.test.ts
```

Esperado: PASS, 8 tests.

- [ ] **Paso 5: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `lib/notice.ts` (nuevo)
- `lib/__tests__/notice.test.ts` (nuevo)

Mensaje sugerido: `feat(pulso): aviso real para la tarjeta destacada de Inicio`

---

## Tarea 13: Rachas ampliadas y constructores de rejilla

**Archivos:**
- Modificar: `lib/streaks.ts`
- Modificar: `lib/__tests__/streaks.test.ts`
- Crear: `features/habits/heatmap.ts`
- Crear: `features/habits/__tests__/heatmap.test.ts`
- Modificar: `features/habits/index.ts`

**Interfaces:**
- Consumes: `currentStreak`, `Cadence` (ya existen); `HeatColumn` de
  `components/ui`.
- Produce, en `lib/streaks.ts`:
  - `bestStreak(entryDates: IsoDate[], cadence: Cadence, today: IsoDate): number`
  - `monthlyCompletion(entryDates: IsoDate[], cadence: Cadence, today: IsoDate): number` — porcentaje 0–100 del mes en curso.
  - `globalStreak(entryDatesByHabit: IsoDate[][], today: IsoDate): number`
- Produce, en `features/habits/heatmap.ts`:
  - `heatColumns(entryDates: IsoDate[], today: IsoDate, weeks: number): HeatColumn[]`
  - `type WeekDot = { date: IsoDate; letter: string; done: boolean; isToday: boolean; isFuture: boolean }`
  - `weekDots(entryDates: IsoDate[], today: IsoDate): WeekDot[]` — siete, de lunes a domingo de la semana en curso.

- [ ] **Paso 1: Escribir los tests que fallan en `lib/__tests__/streaks.test.ts`**

Añade al final del archivo existente (no borres lo que ya hay):

```ts
import { bestStreak, globalStreak, monthlyCompletion } from '@/lib/streaks';

describe('bestStreak', () => {
  it('encuentra la racha más larga aunque no sea la actual', () => {
    const dates = [
      '2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04',
      '2026-07-20',
    ];

    expect(bestStreak(dates, { type: 'daily' }, '2026-07-20')).toBe(4);
  });

  it('sin marcas devuelve cero', () => {
    expect(bestStreak([], { type: 'daily' }, '2026-08-04')).toBe(0);
  });

  it('ignora las marcas posteriores a hoy', () => {
    expect(
      bestStreak(['2026-08-04', '2026-08-05', '2026-08-06'], { type: 'daily' }, '2026-08-04'),
    ).toBe(1);
  });

  it('en semanal cuenta semanas que cumplieron la meta', () => {
    const dates = [
      // Semana del 2026-07-13: 2 marcas, cumple.
      '2026-07-13', '2026-07-15',
      // Semana del 2026-07-20: 2 marcas, cumple.
      '2026-07-20', '2026-07-22',
      // Semana del 2026-07-27: 1 marca, no cumple.
      '2026-07-27',
    ];

    expect(
      bestStreak(dates, { type: 'weekly', targetPerWeek: 2 }, '2026-07-31'),
    ).toBe(2);
  });
});

describe('monthlyCompletion', () => {
  it('en diario es marcas del mes sobre días transcurridos', () => {
    const dates = ['2026-08-01', '2026-08-02', '2026-08-04'];

    expect(monthlyCompletion(dates, { type: 'daily' }, '2026-08-04')).toBe(75);
  });

  it('no cuenta las marcas de otro mes', () => {
    const dates = ['2026-07-31', '2026-08-01'];

    expect(monthlyCompletion(dates, { type: 'daily' }, '2026-08-02')).toBe(50);
  });

  it('en semanal se mide contra la meta por semanas transcurridas', () => {
    // 8 días transcurridos → 2 semanas empezadas → meta 3 × 2 = 6.
    const dates = ['2026-08-01', '2026-08-02', '2026-08-08'];

    expect(
      monthlyCompletion(dates, { type: 'weekly', targetPerWeek: 3 }, '2026-08-08'),
    ).toBe(50);
  });

  it('nunca pasa del 100', () => {
    const dates = ['2026-08-01', '2026-08-01', '2026-08-02', '2026-08-03'];

    expect(monthlyCompletion(dates, { type: 'daily' }, '2026-08-02')).toBe(100);
  });

  it('sin marcas es cero', () => {
    expect(monthlyCompletion([], { type: 'daily' }, '2026-08-04')).toBe(0);
  });
});

describe('globalStreak', () => {
  it('un día cuenta si se marcó cualquier hábito', () => {
    const streak = globalStreak(
      [
        ['2026-08-04', '2026-08-02'],
        ['2026-08-03'],
      ],
      '2026-08-04',
    );

    expect(streak).toBe(3);
  });

  it('sin hábitos es cero', () => {
    expect(globalStreak([], '2026-08-04')).toBe(0);
  });
});
```

- [ ] **Paso 2: Correr los tests y comprobar que fallan**

```powershell
npx vitest run lib/__tests__/streaks.test.ts
```

Esperado: FAIL — `bestStreak is not a function` (o error de importación).

- [ ] **Paso 3: Ampliar `lib/streaks.ts`**

Añade al final del archivo, después de `currentStreak`:

```ts
/** Semanas ISO con al menos `targetPerWeek` marcas, indexadas por su lunes. */
function weeksMeetingTarget(
  marked: Set<IsoDate>,
  targetPerWeek: number,
): Set<IsoDate> {
  const perWeek = new Map<IsoDate, number>();
  for (const date of marked) {
    const week = isoWeekStart(date);
    perWeek.set(week, (perWeek.get(week) ?? 0) + 1);
  }

  const met = new Set<IsoDate>();
  for (const [week, count] of perWeek) {
    if (count >= targetPerWeek) met.add(week);
  }
  return met;
}

/**
 * La racha más larga que se ha tenido, no la de ahora.
 *
 * Sólo ve la ventana de fechas que se le pasa: quien consulta decide cuánto
 * histórico traer. Con la ventana de 84 días de `listHabitsWithProgress`, la
 * "mejor racha" es la mejor de las últimas doce semanas, y eso es lo que la
 * pantalla debe decir.
 */
export function bestStreak(
  entryDates: IsoDate[],
  cadence: Cadence,
  today: IsoDate,
): number {
  const marked = new Set(entryDates.filter((date) => date <= today));
  if (marked.size === 0) return 0;

  const step = cadence.type === 'daily' ? 1 : 7;
  const universe =
    cadence.type === 'daily'
      ? marked
      : weeksMeetingTarget(marked, cadence.targetPerWeek);

  if (universe.size === 0) return 0;

  let best = 0;
  for (const point of universe) {
    // Sólo se cuenta desde el principio de cada racha: así cada una se recorre
    // una vez y no una por cada uno de sus días.
    if (universe.has(addDays(point, -step))) continue;

    let length = 0;
    let cursor = point;
    while (universe.has(cursor)) {
      length += 1;
      cursor = addDays(cursor, step);
    }
    if (length > best) best = length;
  }

  return best;
}

/**
 * Porcentaje del mes en curso, medido contra lo que se esperaba hasta hoy y no
 * contra el mes entero: a día 3 nadie debería ver un 10%.
 */
export function monthlyCompletion(
  entryDates: IsoDate[],
  cadence: Cadence,
  today: IsoDate,
): number {
  const month = today.slice(0, 7);
  const daysElapsed = Number(today.slice(8, 10));

  const marked = new Set(
    entryDates.filter((date) => date <= today && date.startsWith(month)),
  );

  const expected =
    cadence.type === 'daily'
      ? daysElapsed
      : Math.ceil(daysElapsed / 7) * cadence.targetPerWeek;

  if (expected === 0) return 0;

  return Math.min(100, Math.round((marked.size / expected) * 100));
}

/**
 * Racha global: un día cuenta si se marcó cualquier hábito.
 *
 * Es la misma función de siempre aplicada al conjunto; no hay una segunda
 * definición de "racha" que pueda desalinearse con la primera.
 */
export function globalStreak(
  entryDatesByHabit: IsoDate[][],
  today: IsoDate,
): number {
  return currentStreak(entryDatesByHabit.flat(), { type: 'daily' }, today);
}
```

- [ ] **Paso 4: Correr los tests y comprobar que pasan**

```powershell
npx vitest run lib/__tests__/streaks.test.ts
```

Esperado: PASS, los tests que ya había más 12 nuevos.

- [ ] **Paso 5: Escribir el test de los constructores de rejilla**

`features/habits/__tests__/heatmap.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { heatColumns, weekDots } from '../heatmap';

describe('heatColumns', () => {
  it('devuelve una columna por semana, de siete celdas', () => {
    const columns = heatColumns([], '2026-08-04', 5);

    expect(columns).toHaveLength(5);
    expect(columns.every((column) => column.length === 7)).toBe(true);
  });

  it('la última columna es la semana de hoy', () => {
    const columns = heatColumns(['2026-08-04'], '2026-08-04', 5);
    const lastWeek = columns[4];

    // 2026-08-04 es martes: segunda celda de la columna.
    expect(lastWeek[1].level).toBe(1);
    expect(lastWeek[0].level).toBe(0);
  });

  it('marca como fuera de rango los días posteriores a hoy', () => {
    const columns = heatColumns([], '2026-08-04', 5);
    const lastWeek = columns[4];

    expect(lastWeek[2].level).toBe(2);
    expect(lastWeek[6].level).toBe(2);
  });

  it('cada celda lleva una etiqueta legible', () => {
    const columns = heatColumns(['2026-08-03'], '2026-08-04', 1);

    expect(columns[0][0].label).toBe('2026-08-03: cumplido');
    expect(columns[0][1].label).toBe('2026-08-04: sin marcar');
    expect(columns[0][2].label).toBe('2026-08-05: aún no');
  });
});

describe('weekDots', () => {
  it('devuelve siete puntos de lunes a domingo', () => {
    const dots = weekDots([], '2026-08-04');

    expect(dots).toHaveLength(7);
    expect(dots[0].date).toBe('2026-08-03');
    expect(dots[6].date).toBe('2026-08-09');
    expect(dots.map((dot) => dot.letter)).toEqual([
      'L', 'M', 'X', 'J', 'V', 'S', 'D',
    ]);
  });

  it('distingue marcado, hoy y futuro', () => {
    const dots = weekDots(['2026-08-03'], '2026-08-04');

    expect(dots[0]).toMatchObject({ done: true, isToday: false, isFuture: false });
    expect(dots[1]).toMatchObject({ done: false, isToday: true, isFuture: false });
    expect(dots[2]).toMatchObject({ done: false, isToday: false, isFuture: true });
  });
});
```

- [ ] **Paso 6: Correr el test y comprobar que falla**

```powershell
npx vitest run features/habits/__tests__/heatmap.test.ts
```

Esperado: FAIL — no se resuelve `../heatmap`.

- [ ] **Paso 7: Escribir `features/habits/heatmap.ts`**

```ts
import { addDays, isoWeekStart, type IsoDate } from '@/lib/dates';
import type { HeatColumn } from '@/components/ui';

/**
 * Traduce el log de días marcados a la forma que pinta `HeatGrid`.
 *
 * La primitiva no sabe qué es un hábito; esta función sí, y por eso vive en
 * `features/`. La dirección de la importación es la que importa: `features` usa
 * `components/ui`, nunca al revés.
 */
export function heatColumns(
  entryDates: IsoDate[],
  today: IsoDate,
  weeks: number,
): HeatColumn[] {
  const marked = new Set(entryDates);
  const firstMonday = addDays(isoWeekStart(today), -7 * (weeks - 1));

  return Array.from({ length: weeks }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const date = addDays(firstMonday, week * 7 + day);

      if (date > today) {
        return { key: date, level: 2 as const, label: `${date}: aún no` };
      }
      if (marked.has(date)) {
        return { key: date, level: 1 as const, label: `${date}: cumplido` };
      }
      return { key: date, level: 0 as const, label: `${date}: sin marcar` };
    }),
  );
}

const LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export type WeekDot = {
  date: IsoDate;
  letter: string;
  done: boolean;
  isToday: boolean;
  isFuture: boolean;
};

/** La semana en curso en siete puntos, de lunes a domingo. */
export function weekDots(entryDates: IsoDate[], today: IsoDate): WeekDot[] {
  const marked = new Set(entryDates);
  const monday = isoWeekStart(today);

  return LETTERS.map((letter, index) => {
    const date = addDays(monday, index);

    return {
      date,
      letter,
      done: marked.has(date),
      isToday: date === today,
      isFuture: date > today,
    };
  });
}
```

- [ ] **Paso 8: Correr el test y comprobar que pasa**

```powershell
npx vitest run features/habits/__tests__/heatmap.test.ts
```

Esperado: PASS, 6 tests.

- [ ] **Paso 9: Exportarlo desde el barril de hábitos**

Añade a `features/habits/index.ts`:

```ts
export { heatColumns, weekDots, type WeekDot } from './heatmap';
```

- [ ] **Paso 10: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }
```

Esperado: todo verde.

- [ ] **Paso 11: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `lib/streaks.ts`
- `lib/__tests__/streaks.test.ts`
- `features/habits/heatmap.ts` (nuevo)
- `features/habits/__tests__/heatmap.test.ts` (nuevo)
- `features/habits/index.ts`

Mensaje sugerido: `feat(pulso): mejor racha, porcentaje del mes y racha global`

---

## Tarea 14: Saludo por hora local

**Archivos:**
- Modificar: `lib/dates.ts`
- Modificar: `lib/__tests__/dates.test.ts`
- Crear: `lib/greeting.ts`
- Crear: `lib/__tests__/greeting.test.ts`

**Interfaces:**
- Produce:
  - `hourIn(timezone: string, now?: Date): number` en `lib/dates.ts` — 0–23.
  - `greetingFor(hour: number): string` en `lib/greeting.ts` — "Buenos días" ·
    "Buenas tardes" · "Buenas noches".

- [ ] **Paso 1: Escribir los tests que fallan**

Añade a `lib/__tests__/dates.test.ts`:

```ts
import { hourIn } from '@/lib/dates';

describe('hourIn', () => {
  it('devuelve la hora local del usuario, no la del servidor', () => {
    const instant = new Date('2026-08-04T18:30:00Z');

    expect(hourIn('UTC', instant)).toBe(18);
    expect(hourIn('America/Mexico_City', instant)).toBe(12);
    expect(hourIn('Europe/Madrid', instant)).toBe(20);
  });

  it('devuelve 0 y no 24 a medianoche', () => {
    expect(hourIn('UTC', new Date('2026-08-04T00:15:00Z'))).toBe(0);
  });
});
```

Y crea `lib/__tests__/greeting.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { greetingFor } from '@/lib/greeting';

describe('greetingFor', () => {
  it('reparte el día en tres tramos', () => {
    expect(greetingFor(0)).toBe('Buenas noches');
    expect(greetingFor(5)).toBe('Buenos días');
    expect(greetingFor(11)).toBe('Buenos días');
    expect(greetingFor(12)).toBe('Buenas tardes');
    expect(greetingFor(19)).toBe('Buenas tardes');
    expect(greetingFor(20)).toBe('Buenas noches');
    expect(greetingFor(23)).toBe('Buenas noches');
  });
});
```

- [ ] **Paso 2: Correr los tests y comprobar que fallan**

```powershell
npx vitest run lib/__tests__/dates.test.ts lib/__tests__/greeting.test.ts
```

Esperado: FAIL en ambos — `hourIn is not a function` y no se resuelve
`@/lib/greeting`.

- [ ] **Paso 3: Escribir `hourIn` en `lib/dates.ts`**

Añade justo después de `todayIn`:

```ts
/**
 * Hora local del usuario, 0–23. `hourCycle: 'h23'` es lo que evita que
 * medianoche llegue como 24, que es lo que devuelve el ciclo por defecto en
 * varios locales.
 */
export function hourIn(timezone: string, now: Date = new Date()): number {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    hourCycle: 'h23',
  }).format(now);

  return Number(formatted);
}
```

- [ ] **Paso 4: Escribir `lib/greeting.ts`**

```ts
/**
 * Tres tramos y no cuatro: "buenas madrugadas" no existe y a las 3 de la
 * mañana lo correcto en español es seguir dando las buenas noches.
 */
export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}
```

- [ ] **Paso 5: Correr los tests y comprobar que pasan**

```powershell
npx vitest run lib/__tests__/dates.test.ts lib/__tests__/greeting.test.ts
```

Esperado: PASS.

- [ ] **Paso 6: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `lib/dates.ts`
- `lib/__tests__/dates.test.ts`
- `lib/greeting.ts` (nuevo)
- `lib/__tests__/greeting.test.ts` (nuevo)

Mensaje sugerido: `feat(pulso): saludo según la hora local del usuario`

---

## Tarea 15: Consultas de tareas y proyectos

**Archivos:**
- Modificar: `features/tasks/queries.ts`
- Modificar: `features/tasks/index.ts`
- Modificar: `features/projects/queries.ts`
- Modificar: `features/projects/index.ts`

**Interfaces:**
- Consumes: `Task`, `IsoDate`.
- Produce:
  - `listDueUpToToday(today: IsoDate): Promise<Task[]>` — tareas con fecha de
    hoy o anterior, **completadas incluidas**. Es el conjunto del que salen el
    XP ganado y la meta del día.
  - `getTaskById(id: string): Promise<Task | null>`
  - `type ProjectWithCount = Project & { pendingCount: number }`
  - `listProjectsWithCounts(): Promise<ProjectWithCount[]>`

**Decisión documentada.** El "pozo del día" son las tareas con `due_date <=
hoy`, sin mirar *cuándo* se completaron. Una tarea con fecha de hoy que se
completó ayer cuenta como XP de hoy. La alternativa —filtrar por `completed_at`
convertido a la zona del usuario— obligaría a hacer aritmética de zonas horarias
en cada consulta para corregir un caso que casi no ocurre. Se acepta la
simplificación; `weeklyXp` sí usa la fecha real de completado, que es donde la
diferencia se vería.

- [ ] **Paso 1: Ampliar `features/tasks/queries.ts`**

Añade al final del archivo:

```ts
/**
 * El "pozo del día": todo lo que vencía hoy o antes, completado o no.
 *
 * Incluye las completadas a propósito: la meta del día es todo el XP disponible
 * hoy, y una tarea que ya se marcó sigue formando parte de esa meta. Si sólo se
 * trajeran las pendientes, la barra se vaciaría al completar en vez de llenarse.
 */
export async function listDueUpToToday(today: IsoDate): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select(COLUMNS)
    .lte('due_date', today)
    .order('due_date', { ascending: true })
    .order('position', { ascending: true });

  if (error) throw error;
  return data.map(toTask);
}

/** `null` y no error cuando no existe: RLS hace que una tarea ajena se vea
 *  igual que una borrada, y la pantalla responde con notFound() en los dos casos. */
export async function getTaskById(id: string): Promise<Task | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('tasks')
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? toTask(data) : null;
}
```

Añade el import del tipo de fecha en la cabecera del archivo:

```ts
import type { IsoDate } from '@/lib/dates';
```

- [ ] **Paso 2: Exportarlas**

`features/tasks/index.ts` — reemplaza la línea de `queries`:

```ts
export {
  listPendingTasks,
  listTasksForProject,
  listDueUpToToday,
  getTaskById,
} from './queries';
```

- [ ] **Paso 3: Ampliar `features/projects/queries.ts`**

Añade al final:

```ts
export type ProjectWithCount = Project & { pendingCount: number };

/**
 * Proyectos con su conteo de tareas pendientes, para la barra lateral y los
 * chips de filtro.
 *
 * Dos consultas y el conteo en memoria: agregarlo en SQL exigiría una vista o
 * una función, y este bloque tiene un solo cambio de esquema permitido.
 */
export async function listProjectsWithCounts(): Promise<ProjectWithCount[]> {
  const supabase = await createClient();

  const [projects, pending] = await Promise.all([
    listProjects(),
    supabase.from('tasks').select('project_id').is('completed_at', null),
  ]);

  if (pending.error) throw pending.error;

  const counts = new Map<string, number>();
  for (const row of pending.data) {
    if (row.project_id === null) continue;
    counts.set(row.project_id, (counts.get(row.project_id) ?? 0) + 1);
  }

  return projects.map((project) => ({
    ...project,
    pendingCount: counts.get(project.id) ?? 0,
  }));
}
```

- [ ] **Paso 4: Exportarla**

`features/projects/index.ts` — reemplaza la primera línea:

```ts
export {
  listProjects,
  listProjectsWithCounts,
  type Project,
  type ProjectWithCount,
} from './queries';
```

- [ ] **Paso 5: Verificar**

```powershell
npm run typecheck; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde. Las consultas todavía no las llama nadie; el build
confirma que compilan contra los tipos regenerados en la Tarea 10.

- [ ] **Paso 6: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `features/tasks/queries.ts`
- `features/tasks/index.ts`
- `features/projects/queries.ts`
- `features/projects/index.ts`

Mensaje sugerido: `feat(pulso): consultas del pozo del día y proyectos con conteo`

---

## Tarea 16: Consultas de progreso, hábito y perfil

**Archivos:**
- Crear: `features/progress/queries.ts`
- Crear: `features/progress/index.ts`
- Modificar: `features/habits/queries.ts`
- Modificar: `features/habits/index.ts`
- Modificar: `features/profile/queries.ts`

**Interfaces:**
- Consumes: `lifetimeXp`, `levelFromXp`, `weeklyXp` (Tarea 11); `todayIn`,
  `addDays` (`lib/dates`); `HabitWithProgress`.
- Produce:
  - `type LifetimeTotals = { completedByPriority: Record<TaskPriority, number>; habitEntries: number }`
  - `getLifetimeTotals(): Promise<LifetimeTotals>`
  - `getLevel(): Promise<LevelInfo & { totalXp: number }>`
  - `getWeeklyXp(today: IsoDate, timezone: string): Promise<DayPoint[]>`
  - `getHabitById(id: string, today: IsoDate): Promise<HabitWithProgress | null>` — ventana de 84 días, la misma que la lista.
  - `Profile.email: string`

- [ ] **Paso 1: Escribir `features/progress/queries.ts`**

```ts
import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { addDays, todayIn, type IsoDate } from '@/lib/dates';
import {
  levelFromXp,
  lifetimeXp,
  weeklyXp,
  type DayPoint,
  type LevelInfo,
  type XpPriority,
} from '@/lib/xp';

const PRIORITIES: XpPriority[] = ['none', 'low', 'medium', 'high'];

export type LifetimeTotals = {
  completedByPriority: Record<XpPriority, number>;
  habitEntries: number;
};

/**
 * Totales históricos, con `head: true`: Postgres cuenta y no manda ni una fila.
 * Traer el histórico completo para contarlo en memoria funcionaría hoy y se
 * caería el año que viene.
 */
export async function getLifetimeTotals(): Promise<LifetimeTotals> {
  const supabase = await createClient();

  const done = (priority: XpPriority) =>
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('priority', priority)
      .not('completed_at', 'is', null);

  const [entries, none, low, medium, high] = await Promise.all([
    supabase.from('habit_entries').select('id', { count: 'exact', head: true }),
    done('none'),
    done('low'),
    done('medium'),
    done('high'),
  ]);

  for (const result of [entries, none, low, medium, high]) {
    if (result.error) throw result.error;
  }

  return {
    completedByPriority: {
      none: none.count ?? 0,
      low: low.count ?? 0,
      medium: medium.count ?? 0,
      high: high.count ?? 0,
    },
    habitEntries: entries.count ?? 0,
  };
}

export async function getLevel(): Promise<LevelInfo & { totalXp: number }> {
  const totals = await getLifetimeTotals();
  const totalXp = lifetimeXp(totals.completedByPriority, totals.habitEntries);

  return { ...levelFromXp(totalXp), totalXp };
}

/**
 * XP de los últimos siete días.
 *
 * `completed_at` es un instante con zona; el día al que pertenece depende de la
 * zona del perfil, así que se convierte aquí y no en SQL. La ventana pedida a
 * la base lleva un día de margen por cada lado para que ninguna zona horaria
 * deje fuera un completado del borde.
 */
export async function getWeeklyXp(
  today: IsoDate,
  timezone: string,
): Promise<DayPoint[]> {
  const supabase = await createClient();

  const windowStart = addDays(today, -6);

  const [tasks, entries] = await Promise.all([
    supabase
      .from('tasks')
      .select('priority, completed_at')
      .not('completed_at', 'is', null)
      .gte('completed_at', `${addDays(windowStart, -1)}T00:00:00Z`),
    supabase
      .from('habit_entries')
      .select('entry_date')
      .gte('entry_date', windowStart)
      .lte('entry_date', today),
  ]);

  if (tasks.error) throw tasks.error;
  if (entries.error) throw entries.error;

  const completions = tasks.data.map((row) => ({
    date: todayIn(timezone, new Date(row.completed_at!)),
    priority: row.priority as XpPriority,
  }));

  return weeklyXp(
    completions,
    entries.data.map((row) => row.entry_date),
    today,
  );
}
```

- [ ] **Paso 2: Crear el barril `features/progress/index.ts`**

```ts
export {
  getLifetimeTotals,
  getLevel,
  getWeeklyXp,
  type LifetimeTotals,
} from './queries';
```

- [ ] **Paso 3: Añadir `getHabitById` a `features/habits/queries.ts`**

Añade al final del archivo:

```ts
/**
 * Un hábito con su progreso, con la misma ventana de 84 días que la lista: la
 * pantalla de detalle enseña cinco semanas de heatmap y la mejor racha, y las
 * dos deben medirse contra el mismo histórico que la tarjeta.
 */
export async function getHabitById(
  id: string,
  today: IsoDate,
  sinceDays = 84,
): Promise<HabitWithProgress | null> {
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from('habits')
    .select('id, name, color, icon, cadence, target_per_week')
    .eq('id', id)
    .is('archived_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!row) return null;

  const since = addDays(today, -sinceDays);

  const { data: entryRows, error: entriesError } = await supabase
    .from('habit_entries')
    .select('entry_date')
    .eq('habit_id', id)
    .gte('entry_date', since)
    .lte('entry_date', today);

  if (entriesError) throw entriesError;

  const habit: Habit = {
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon,
    cadence: row.cadence,
    targetPerWeek: row.target_per_week,
  };

  const entryDates = entryRows.map((entry) => entry.entry_date);

  return {
    ...habit,
    entryDates,
    streak: currentStreak(entryDates, toCadence(habit), today),
    doneToday: entryDates.includes(today),
  };
}
```

- [ ] **Paso 4: Exportarla**

`features/habits/index.ts` — reemplaza la línea de `queries`:

```ts
export { listHabitsWithProgress, getHabitById } from './queries';
```

- [ ] **Paso 5: Añadir el correo al perfil**

`features/profile/queries.ts` — reemplaza el tipo y el cuerpo de `getProfile`:

```ts
export type Profile = {
  id: string;
  displayName: string | null;
  /** Del usuario de Auth, no de `profiles`: la tabla no lo duplica. */
  email: string;
  timezone: string;
};

export async function getProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Sin sesión');

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, timezone')
    .eq('id', user.id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    displayName: data.display_name,
    email: user.email ?? '',
    timezone: data.timezone,
  };
}
```

- [ ] **Paso 6: Verificar**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 7: Comprobar los conteos contra la base**

Herramienta: `mcp__claude_ai_Supabase__execute_sql`, `project_id`
`nozxsibtojorqhloxgxq`:

```sql
select priority, count(*) as completadas
from public.tasks
where completed_at is not null
group by priority
order by priority;
```

Guarda el resultado: la Tarea 27 comprobará que el nivel que pinta `/progreso`
coincide con `lifetimeXp` aplicado a estos números.

- [ ] **Paso 8: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `features/progress/queries.ts` (nuevo)
- `features/progress/index.ts` (nuevo)
- `features/habits/queries.ts`
- `features/habits/index.ts`
- `features/profile/queries.ts`

Mensaje sugerido: `feat(pulso): consultas de nivel, XP semanal y detalle de hábito`

---

→ Continúa en [04 — Shell, navegación y captura](04-shell-navegacion-y-captura.md)

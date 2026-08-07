# 06 — Tareas y detalle (Tareas 22–23)

← [05 — Pantalla Inicio](05-pantalla-inicio.md) · → [07 — Hábitos y detalle](07-habitos-y-detalle.md)

**Entrega de este archivo:** `/tareas` con chips de proyecto y `/tareas/[id]`
como página completa en móvil y panel derecho en escritorio, con el enlace
directo funcionando igual en los dos anchos.

Lee las **Restricciones globales** del [README](README.md#restricciones-globales).

---

## Tarea 22: `/tareas` con chips de proyecto

**Archivos:**
- Crear: `features/tasks/components/task-list.tsx`
- Crear: `app/(app)/tareas/tasks-screen.tsx`
- Reemplazar: `app/(app)/tareas/page.tsx`
- Modificar: `features/tasks/index.ts`

**Interfaces:**
- Consumes: `listPendingTasks`, `groupTasks` (ya existían);
  `listProjectsWithCounts` (Tarea 15); `getTodayForUser`; `TaskItem` (Tarea 21);
  `Chip` (Tarea 5).
- Produce:
  - `<TaskList tasks projects today />` — client component; lee el filtro de
    `?proyecto=` con `useSearchParams`.
  - `<TasksScreen />` — server component reutilizado por `page.tsx` y por
    `default.tsx` en la Tarea 23.

**El filtro vive en la URL y lo lee el cliente.** En la Tarea 23 la lista se
renderiza también desde un `default.tsx`, y `default.tsx` no recibe
`searchParams`. Si el filtro se resolviera en el servidor, abrir una tarea
perdería el filtro; leyéndolo con `useSearchParams` sobrevive a la navegación al
detalle. La lista de tareas pendientes de una persona cabe de sobra en memoria,
así que filtrar en el cliente no cuesta nada.

**En móvil los proyectos son chips de filtro aquí.** Dejaron de ser un destino
de primer nivel: el prototipo tiene cinco y cinco es el máximo cómodo en una
barra inferior.

- [ ] **Paso 1: Escribir la lista**

`features/tasks/components/task-list.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Chip } from '@/components/ui';
import type { IsoDate } from '@/lib/dates';
import type { ProjectWithCount } from '@/features/projects';
import { groupTasks } from '../grouping';
import type { Task } from '../types';
import { TaskItem } from './task-item';

const SECTIONS = [
  { key: 'overdue', label: 'Vencidas' },
  { key: 'today', label: 'Hoy' },
  { key: 'upcoming', label: 'Próximas' },
  { key: 'someday', label: 'Sin fecha' },
] as const;

export function TaskList({
  tasks,
  projects,
  today,
}: {
  tasks: Task[];
  projects: ProjectWithCount[];
  today: IsoDate;
}) {
  const selected = useSearchParams().get('proyecto');

  const visible =
    selected === null
      ? tasks
      : tasks.filter((task) => task.projectId === selected);

  const groups = groupTasks(visible, today);

  return (
    <div className="flex flex-col gap-6">
      {projects.length > 0 && (
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
          {/* El <Link> envuelve al chip en vez de meterse dentro: así el área
              pulsable es la píldora entera y `Chip` no necesita saber de rutas. */}
          <Link href="/tareas" className="shrink-0">
            <Chip as="span" selected={selected === null}>
              Todas
            </Chip>
          </Link>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/tareas?proyecto=${project.id}`}
              className="shrink-0"
            >
              <Chip as="span" dot={project.color} selected={selected === project.id}>
                {project.name}
                <span className="text-caption opacity-70">
                  {project.pendingCount}
                </span>
              </Chip>
            </Link>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-body text-text-muted">
          {selected === null
            ? 'No tienes tareas pendientes. Usa el botón + para crear la primera.'
            : 'Este proyecto no tiene tareas pendientes.'}
        </p>
      ) : (
        SECTIONS.map(({ key, label }) => {
          const group = groups[key];
          if (group.length === 0) return null;

          return (
            <section key={key} className="flex flex-col gap-3">
              <h2
                className={`text-caption uppercase ${
                  key === 'overdue' ? 'text-accent-warm' : 'text-text-muted'
                }`}
              >
                {label} ({group.length})
              </h2>
              {/* El enlace va dentro de la fila, en el título: envolver la fila
                  entera pondría un <a> alrededor de la casilla y marcar
                  navegaría. */}
              <ul className="flex flex-col gap-2">
                {group.map((task) => (
                  <TaskItem key={task.id} task={task} href={`/tareas/${task.id}`} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
```

- [ ] **Paso 2: Dar a `TaskItem` un enlace opcional**

`features/tasks/components/task-item.tsx` — añade la prop y envuelve sólo el
título. Reemplaza la firma y el `<span>` del título:

```tsx
import Link from 'next/link';
```

```tsx
export function TaskItem({ task, href }: { task: Task; href?: string }) {
```

```tsx
        {href ? (
          <Link
            href={href}
            className={`min-w-0 flex-1 truncate text-body transition-colors hover:text-accent ${
              optimisticDone ? 'text-text-muted line-through' : 'text-text'
            }`}
          >
            {task.title}
          </Link>
        ) : (
          <span
            className={`min-w-0 flex-1 truncate text-body ${
              optimisticDone ? 'text-text-muted line-through' : 'text-text'
            }`}
          >
            {task.title}
          </span>
        )}
```

Así la casilla marca y el título navega, que es lo que espera cualquiera.

- [ ] **Paso 3: Escribir la pantalla de servidor**

`app/(app)/tareas/tasks-screen.tsx`:

```tsx
import { Suspense } from 'react';
import { getTodayForUser } from '@/features/profile';
import { listProjectsWithCounts } from '@/features/projects';
import { listPendingTasks, TaskList } from '@/features/tasks';

/**
 * Vive aquí y no en `page.tsx` porque la Tarea 23 la renderiza también desde
 * `default.tsx`: con las rutas paralelas, la lista se pinta tanto en `/tareas`
 * como en `/tareas/[id]`.
 */
export async function TasksScreen() {
  const [today, tasks, projects] = await Promise.all([
    getTodayForUser(),
    listPendingTasks(),
    listProjectsWithCounts(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-display text-text">Tareas</h1>
      {/* `useSearchParams` obliga a un límite de Suspense. */}
      <Suspense fallback={null}>
        <TaskList tasks={tasks} projects={projects} today={today} />
      </Suspense>
    </div>
  );
}
```

- [ ] **Paso 4: Reemplazar la página**

`app/(app)/tareas/page.tsx`:

```tsx
import { TasksScreen } from './tasks-screen';

export default function TasksPage() {
  return <TasksScreen />;
}
```

- [ ] **Paso 5: Exportar la lista**

`features/tasks/index.ts` — añade:

```ts
export { TaskList } from './components/task-list';
```

- [ ] **Paso 6: Verificar a mano**

```powershell
npm run dev
```

En `/tareas`:

1. Fila de chips: "Todas" seleccionada y un chip por proyecto con su punto de
   color y su conteo de pendientes.
2. Pulsa un chip: la URL pasa a `/tareas?proyecto=…` y la lista se reduce a ese
   proyecto. El conteo del chip coincide con las filas visibles.
3. Un proyecto sin pendientes muestra "Este proyecto no tiene tareas
   pendientes.", no la lista vacía general.
4. Marcar la casilla de una tarea **no navega**. Pulsar el título sí lleva a
   `/tareas/<id>` — que todavía da 404. Es esperado hasta la Tarea 23.

- [ ] **Paso 7: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde.

- [ ] **Paso 8: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `features/tasks/components/task-list.tsx` (nuevo)
- `features/tasks/components/task-item.tsx`
- `app/(app)/tareas/tasks-screen.tsx` (nuevo)
- `app/(app)/tareas/page.tsx`
- `features/tasks/index.ts`

Mensaje sugerido: `feat(pulso): pantalla de tareas con chips de proyecto`

---

## Tarea 23: Maestro-detalle `/tareas/[id]`

**Archivos:**
- Modificar: `app/globals.css` (clases `.master-detail`)
- Crear: `app/(app)/tareas/layout.tsx`
- Crear: `app/(app)/tareas/default.tsx`
- Crear: `app/(app)/tareas/@detalle/default.tsx`
- Crear: `app/(app)/tareas/@detalle/[id]/page.tsx`
- Crear: `features/tasks/components/task-detail.tsx`
- Modificar: `features/tasks/index.ts`

**Interfaces:**
- Consumes: `getTaskById` (Tarea 15); `listProjects`; `setTaskCompleted`,
  `deleteTask` (ya existían); `Card`, `Chip`, `CheckBox`, `IconButton`,
  `ChevronLeftIcon`, `TrashIcon`, `CalendarIcon`, `FlagIcon`.
- Produce: `<TaskDetail task projectName />`.

**Se resuelve con rutas paralelas y visibilidad por CSS.** En escritorio la
lista y el panel conviven; en móvil la lista se oculta cuando hay un detalle
abierto. El costo aceptado es que en móvil la lista se renderiza aunque no se
vea. A cambio, el enlace directo a una tarea funciona igual en los dos anchos y
no hay parpadeo de hidratación —que es lo que pasa cuando el layout se decide
leyendo el viewport en el cliente.

**Cómo casan las rutas:** en `/tareas`, el slot `children` usa `page.tsx` y
`@detalle` usa su `default.tsx` (que no pinta nada). En `/tareas/<id>`,
`children` no tiene segmento `[id]` y cae en su `default.tsx` —que vuelve a
pintar la lista— mientras `@detalle` casa con `[id]/page.tsx`.

- [ ] **Paso 1: Añadir las clases de maestro-detalle a `app/globals.css`**

Al final del archivo, después del bloque `.sheet`:

```css
/* La visibilidad la decide `:has()`, no JavaScript: cuando el slot de detalle
   pinta algo, la lista se esconde en móvil y convive con él desde `lg`. Sin
   estado que hidratar no hay parpadeo al cargar un enlace directo. */
.master-detail {
  display: block;
}

.master-detail:has([data-detalle]) .master-detail__lista {
  display: none;
}

@media (min-width: 1024px) {
  .master-detail {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 22rem;
    gap: 1.5rem;
    align-items: start;
  }

  .master-detail:has([data-detalle]) .master-detail__lista {
    display: block;
  }
}
```

- [ ] **Paso 2: Escribir el layout con los dos slots**

`app/(app)/tareas/layout.tsx`:

```tsx
export default function TasksLayout({
  children,
  detalle,
}: Readonly<{ children: React.ReactNode; detalle: React.ReactNode }>) {
  return (
    <div className="master-detail">
      <div className="master-detail__lista">{children}</div>
      {detalle}
    </div>
  );
}
```

- [ ] **Paso 3: Escribir los dos `default.tsx`**

`app/(app)/tareas/default.tsx` — lo que ve el slot `children` cuando la URL
lleva un id:

```tsx
import { TasksScreen } from './tasks-screen';

export default function TasksDefault() {
  return <TasksScreen />;
}
```

`app/(app)/tareas/@detalle/default.tsx` — sin detalle abierto no se pinta nada,
y sin `[data-detalle]` en el árbol la regla de CSS no oculta la lista:

```tsx
export default function DetailDefault() {
  return null;
}
```

- [ ] **Paso 4: Escribir el panel de detalle**

`features/tasks/components/task-detail.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOptimistic, useState, useTransition } from 'react';
import {
  CalendarIcon,
  Card,
  CheckBox,
  ChevronLeftIcon,
  Chip,
  FlagIcon,
  IconButton,
  TrashIcon,
} from '@/components/ui';
import { formatDayMonth } from '@/lib/dates';
import { deleteTask, setTaskCompleted } from '../actions';
import type { Task, TaskPriority } from '../types';

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  none: 'Sin prioridad',
  low: 'Prioridad baja',
  medium: 'Prioridad media',
  high: 'Prioridad alta',
};

export function TaskDetail({
  task,
  projectName,
  projectColor,
}: {
  task: Task;
  projectName: string | null;
  projectColor: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimisticDone, setOptimisticDone] = useOptimistic(
    task.completedAt !== null,
  );

  function toggle() {
    setError(null);
    startTransition(async () => {
      setOptimisticDone(!optimisticDone);
      const result = await setTaskCompleted(task.id, !optimisticDone);
      if (!result.ok) setError(result.error);
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTask(task.id);
      if (result.ok) {
        // Volver a la lista: el panel se queda sin contenido que enseñar.
        router.push('/tareas');
      } else {
        setError(result.error);
      }
    });
  }

  return (
    // `data-detalle` es lo que la regla de CSS busca para ocultar la lista en
    // móvil. No es decorativo: si desaparece, el maestro-detalle deja de serlo.
    <div data-detalle className="lg:sticky lg:top-6">
      <Card className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/tareas"
            className="flex items-center gap-1 text-label text-text-soft transition-colors hover:text-accent lg:hidden"
          >
            <ChevronLeftIcon className="size-5" />
            Tareas
          </Link>
          <IconButton
            label="Eliminar tarea"
            tone="danger"
            disabled={pending}
            onClick={remove}
            className="ml-auto"
          >
            <TrashIcon className="size-5" />
          </IconButton>
        </div>

        <div className="flex items-start gap-3">
          <CheckBox
            checked={optimisticDone}
            onToggle={toggle}
            disabled={pending}
            label={`Completar ${task.title}`}
          />
          <h1
            className={`text-title ${
              optimisticDone ? 'text-text-muted line-through' : 'text-text'
            }`}
          >
            {task.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip>
            <FlagIcon className="size-4" />
            {PRIORITY_LABEL[task.priority]}
          </Chip>
          <Chip>
            <CalendarIcon className="size-4" />
            {task.dueDate ? formatDayMonth(task.dueDate) : 'Sin fecha'}
          </Chip>
          {projectName && (
            <Chip dot={projectColor ?? undefined}>{projectName}</Chip>
          )}
        </div>

        {task.notes && (
          <p className="whitespace-pre-wrap text-body text-text-soft">
            {task.notes}
          </p>
        )}

        {error && <p className="text-label text-accent-warm">{error}</p>}
      </Card>
    </div>
  );
}
```

- [ ] **Paso 5: Escribir la página del slot**

`app/(app)/tareas/@detalle/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { listProjects } from '@/features/projects';
import { getTaskById, TaskDetail } from '@/features/tasks';

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [task, projects] = await Promise.all([getTaskById(id), listProjects()]);

  // RLS hace que una tarea ajena se vea igual que una borrada, y las dos
  // merecen la misma respuesta.
  if (!task) notFound();

  const project = projects.find((candidate) => candidate.id === task.projectId);

  return (
    <TaskDetail
      task={task}
      projectName={project?.name ?? null}
      projectColor={project?.color ?? null}
    />
  );
}
```

- [ ] **Paso 6: Exportar el detalle y dejar el barril completo**

`features/tasks/index.ts` queda así, ya definitivo para este bloque:

```ts
export type { Task, TaskPriority } from './types';
export { groupTasks, type GroupedTasks } from './grouping';
export {
  listPendingTasks,
  listTasksForProject,
  listDueUpToToday,
  getTaskById,
} from './queries';
export { createTask, setTaskCompleted, deleteTask } from './actions';
export { TaskItem } from './components/task-item';
export { TaskList } from './components/task-list';
export { TaskDetail } from './components/task-detail';
```

- [ ] **Paso 7: Verificar en escritorio**

```powershell
npm run dev
```

A 1280px, en `/tareas`:

1. Sólo la lista, ocupando el ancho.
2. Pulsa el título de una tarea: la URL pasa a `/tareas/<id>`, **la lista sigue
   visible** a la izquierda y el panel aparece a la derecha, pegado arriba.
3. Marca la casilla del panel: el título se tacha.
4. Pulsa la papelera: vuelve a `/tareas` y la tarea desapareció de la lista.
5. Pega `/tareas/<id>` en una pestaña nueva: carga con lista y panel, sin
   parpadeo.

- [ ] **Paso 8: Verificar en móvil**

A 390px:

6. En `/tareas` sólo la lista.
7. Pulsa el título de una tarea: **la lista desaparece** y queda el panel a
   pantalla completa, con el enlace "‹ Tareas" arriba.
8. Ese enlace vuelve a la lista.
9. Pega `/tareas/<id>` en una pestaña nueva a 390px: se abre directamente el
   panel, sin ver la lista ni un parpadeo de ella.
10. Un id inventado (`/tareas/00000000-0000-0000-0000-000000000000`) da la
    página de 404 de Next, no un error 500.

- [ ] **Paso 9: Batería completa**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }
```

Esperado: todo verde. Si el build se queja de que falta un `default.tsx` para
algún slot, revisa que existan **los dos** del Paso 3.

- [ ] **Paso 10: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `app/globals.css`
- `app/(app)/tareas/layout.tsx` (nuevo)
- `app/(app)/tareas/default.tsx` (nuevo)
- `app/(app)/tareas/@detalle/default.tsx` (nuevo)
- `app/(app)/tareas/@detalle/[id]/page.tsx` (nuevo)
- `features/tasks/components/task-detail.tsx` (nuevo)
- `features/tasks/index.ts`

Mensaje sugerido: `feat(pulso): maestro-detalle de tareas con rutas paralelas`

---

→ Continúa en [07 — Hábitos y detalle](07-habitos-y-detalle.md)

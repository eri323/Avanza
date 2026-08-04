# Pulso Shell — Plan de implementación

> **Para agentes ejecutores:** SUB-SKILL REQUERIDA: usa
> `superpowers:subagent-driven-development` (recomendado) o
> `superpowers:executing-plans` para implementar este plan tarea por tarea. Los
> pasos usan sintaxis de casilla (`- [ ]`) para llevar el seguimiento.

**Spec de origen:** `docs/superpowers/specs/2026-08-04-pulso-shell-design.md`

**Objetivo:** reemplazar la piel de scaffold de Avanza por el sistema de diseño
Pulso, con dos layouts reales —móvil y escritorio— y siete pantallas cuyos
números salen todos de la base o de funciones puras con tests.

**Arquitectura:** un archivo de tokens semánticos en `app/globals.css` alimenta
nueve primitivas sin dominio en `components/ui/`; `components/shell/` monta el
layout responsive decidido por CSS (barra inferior en móvil, barra lateral en
escritorio) y el punto único de captura; las pantallas de `app/(app)/` componen
primitivas con datos que llegan ya calculados desde `features/*/queries.ts` y
desde dos módulos puros nuevos, `lib/xp.ts` y `lib/notice.ts`. El único cambio
de esquema es una columna.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 ·
Supabase (Auth + Postgres) · Vitest 4 · Playwright 1.62.

---

## Regla de git — vence a cualquier paso de este plan

**Nunca ejecutes comandos de git.** Ninguna tarea de este plan termina en
`git commit`. Cada tarea termina en un paso de *reporte*: listar los archivos
tocados y sugerir el mensaje de commit. El autor commitea a mano.

Sólo se permiten comandos de git de lectura (`status`, `diff`, `log`, `show`).

---

## Restricciones globales

Aplican a **todas** las tareas. No se repiten en cada una.

- **Interfaz y mensajes de error en español; identificadores en inglés.**
- Las Server Actions devuelven `ActionResult` (`lib/result.ts`), **no lanzan**
  hacia la interfaz.
- Los errores de Postgres se traducen por código en `messageForDbError`, nunca
  por texto.
- La lógica con reglas vive en funciones puras en `lib/`, con tests de Vitest.
- Las fechas cruzan la frontera cliente/servidor como `string` `YYYY-MM-DD`
  (`IsoDate`). Nunca `Date`.
- **La racha nunca se almacena.** Se deriva de `habit_entries`.
- **El XP nunca se almacena.** Se deriva de tareas completadas y de
  `habit_entries`. (Bloque 4 lo persistirá; este bloque no.)
- `habit_entries` es append-only: marcar es INSERT, desmarcar es DELETE.
- Las FK a `projects` y `habits` son compuestas (incluyen `user_id`).
- **No se instala shadcn/ui.** Ni ninguna librería de iconos: los iconos son
  SVG en `components/ui/icons.tsx`.
- Único cambio de esquema permitido en este bloque:
  `alter table habits add column icon text;` (Tarea 10). Cualquier otro se
  consulta con el autor antes de tocar nada.
- `migrations/` está en `.gitignore`. Se escriben archivos ahí, **no** se
  agregan al índice ni se propone trackearlos.
- Shell de desarrollo: PowerShell (Windows).

### Comandos de verificación

| Qué | Comando |
|---|---|
| Tests unitarios (todos) | `npm run test` |
| Un archivo de test | `npx vitest run <ruta>` |
| Tipos | `npm run typecheck` |
| Lint | `npm run lint` |
| Build de producción | `npm run build` |
| E2E | `npm run test:e2e` |

### Tokens: valores exactos

Los valores de la tabla del spec se copian literalmente. **Una sola desviación
documentada:** `text-muted` en tema claro pasa de `#8B7FA8` a `#766A92`.
Razón: `#8B7FA8` sobre `#FBF7FF` da 3.5:1, por debajo de AA (4.5:1) para texto
normal; `#766A92` da 4.7:1. En tema oscuro se conserva `#8B7FA8` (5.1:1 sobre
`#150C28`, cumple). El criterio de éxito 4 del spec sólo exige AA en oscuro,
pero fallar en claro sería un defecto igual. La Tarea 33 vuelve a medirlo.

### Reglas de uso de color (no negociables)

Medidas contra los fondos reales, no inventadas:

- `accent` `#8B5CF6` — 4.0:1 sobre `surface` claro. **Nunca como texto
  pequeño.** Sí para rellenos, bordes, iconos y texto ≥ 24px o ≥ 19px en negrita.
- `accent-warm` `#FF5E7E` — 2.8:1 sobre claro. **Sólo relleno y gradiente.**
- `positive` `#67E8A0` — 1.5:1 sobre claro, 12.3:1 sobre oscuro. **Sólo sobre
  superficies oscuras** (`surface-feature`).
- `text-muted` — metadatos secundarios. Nunca contenido esencial.
- El gradiente de marca `135deg, #8B5CF6 → #FF5E7E` queda reservado al FAB, al
  botón "Añadir" de la barra lateral y al botón de acción principal de cada
  pantalla. En ningún otro sitio.

---

## Estructura de archivos

Lo que existe hoy y lo que este plan crea o mueve.

```
app/
  globals.css                    MODIFICAR  tokens Pulso, se borra el scaffold
  layout.tsx                     MODIFICAR  fuente, script de tema, sin <Nav>
  nav.tsx                        BORRAR     lo reemplaza components/shell/
  page.tsx                       MODIFICAR  redirect a /inicio
  manifest.ts                    MODIFICAR  start_url y colores Pulso
  theme-script.tsx               CREAR      script inline anti-parpadeo
  login/page.tsx                 MODIFICAR  piel nueva
  (app)/layout.tsx               CREAR      monta AppShell
  (app)/inicio/page.tsx          MOVER      desde app/hoy/
  (app)/tareas/                  MOVER      + rutas paralelas de detalle
  (app)/habitos/                 MOVER      + [id]/
  (app)/progreso/page.tsx        CREAR
  (app)/perfil/                  MOVER      desde app/ajustes/
  (app)/proyectos/               MOVER

components/ui/                   CREAR  primitivas sin dominio
  icons.tsx  card.tsx  chip.tsx  check-box.tsx  icon-button.tsx
  progress-bar.tsx  stat-tile.tsx  heat-grid.tsx  sheet.tsx  fab.tsx
  index.ts

components/shell/                CREAR
  app-shell.tsx  sidebar.tsx  bottom-nav.tsx  nav-items.ts
  capture-provider.tsx  capture-sheet.tsx  capture-launcher.tsx
  theme-toggle.tsx

lib/
  theme.ts                       CREAR   resolución de tema (pura)
  xp.ts                          CREAR   XP, meta del día, nivel (pura)
  notice.ts                      CREAR   aviso de Inicio (pura)
  greeting.ts                    CREAR   saludo por hora (pura)
  dates.ts                       MODIFICAR  + hourIn
  streaks.ts                     MODIFICAR  + bestStreak, monthlyCompletion,
                                            globalStreak

features/
  tasks/queries.ts               MODIFICAR  + listDueUpToToday, getTaskById
  tasks/components/quick-add.tsx BORRAR     lo reemplaza la hoja de captura
  tasks/components/task-item.tsx MODIFICAR  piel nueva
  habits/queries.ts              MODIFICAR  + icon, getHabitById
  habits/heatmap.ts              CREAR      builders puros de rejilla y semana
  habits/actions.ts              MODIFICAR  + icon, + updateHabit
  habits/components/             MODIFICAR  piel nueva
  projects/queries.ts            MODIFICAR  + listProjectsWithCounts
  profile/queries.ts             MODIFICAR  + email
  progress/queries.ts            CREAR      totales históricos y semana
  today/queries.ts               MODIFICAR  getHomeData

migrations/0004_habits_icon.sql  CREAR   (fuera de git, por .gitignore)
```

**Por qué esta partición:** las primitivas de `components/ui/` no importan nada
de `features/`. Es la condición del criterio de éxito 5 —que los bloques 2 a 5
las reutilicen sin tocarlas— y la única forma de comprobarlo es que el grafo de
importaciones no tenga esa arista.

---

## Orden de ejecución

Cada archivo depende del anterior. No se saltan.

| # | Archivo | Tareas | Entrega |
|---|---------|--------|---------|
| 01 | [`01-fundamentos-visuales.md`](01-fundamentos-visuales.md) | 1–3 | Tokens, tipografía y tema claro/oscuro funcionando |
| 02 | [`02-primitivas-ui.md`](02-primitivas-ui.md) | 4–9 | Las nueve primitivas de `components/ui/` |
| 03 | [`03-datos-derivados.md`](03-datos-derivados.md) | 10–16 | Columna `icon`, módulos puros con tests y consultas nuevas |
| 04 | [`04-shell-navegacion-y-captura.md`](04-shell-navegacion-y-captura.md) | 17–19 | Rutas nuevas, shell responsive y punto único de captura |
| 05 | [`05-pantalla-inicio.md`](05-pantalla-inicio.md) | 20–21 | `/inicio` completa, con XP y aviso reales |
| 06 | [`06-tareas-y-detalle.md`](06-tareas-y-detalle.md) | 22–23 | `/tareas` y maestro-detalle `/tareas/[id]` |
| 07 | [`07-habitos-y-detalle.md`](07-habitos-y-detalle.md) | 24–26 | `/habitos`, edición completa y `/habitos/[id]` |
| 08 | [`08-progreso-perfil-y-resto.md`](08-progreso-perfil-y-resto.md) | 27–30 | `/progreso`, `/perfil`, `/proyectos`, `/login` |
| 09 | [`09-pruebas-y-cierre.md`](09-pruebas-y-cierre.md) | 31–33 | Playwright actualizado y ampliado, auditoría AA |

---

## Criterios de éxito (del spec, verificados en la Tarea 33)

1. Las siete pantallas son reconocibles como el prototipo en un móvil de 390px.
2. En escritorio la barra lateral y el maestro-detalle funcionan, y el enlace
   directo a una tarea abre bien en ambos anchos.
3. Ningún número en pantalla es inventado: todo sale de la base o de una función
   pura con tests.
4. En tema oscuro no hay ningún par de colores de texto por debajo de AA.
5. Los bloques 2 a 5 no obligan a rehacer las primitivas de `components/ui/`.

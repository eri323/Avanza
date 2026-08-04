# 09 — Pruebas y cierre (Tareas 31–33)

← [08 — Progreso, perfil y resto](08-progreso-perfil-y-resto.md) · [README](README.md)

**Entrega de este archivo:** los tres recorridos de Playwright funcionando
contra la interfaz nueva, dos recorridos nuevos —los cinco destinos en móvil y
en escritorio, y el tema que persiste— y la auditoría de contraste que cierra el
criterio de éxito 4.

Lee las **Restricciones globales** del [README](README.md#restricciones-globales).

---

## Tarea 31: Actualizar los recorridos existentes

**Archivos:**
- Modificar: `playwright.config.ts`
- Crear: `e2e/helpers.ts`
- Modificar: `e2e/auth.setup.ts`
- Reemplazar: `e2e/tasks.spec.ts`
- Reemplazar: `e2e/habits.spec.ts`

**Interfaces:**
- Produce: `openCapture(page)` y `createTask(page, title)` en `e2e/helpers.ts`,
  usados por los recorridos de esta tarea y de la 32.

**Por qué hace falta un ayudante.** El punto de entrada de la captura es un FAB
en móvil y un botón "Añadir" en la barra lateral en escritorio. Es el mismo
componente `Sheet` con otra posición, pero el selector que lo abre cambia con el
ancho, y los recorridos corren en los dos.

- [ ] **Paso 1: Añadir el proyecto móvil a la configuración**

`playwright.config.ts` — reemplaza el bloque `projects`:

```ts
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      // 390px es el ancho del criterio de éxito 1. Se prueba de verdad, no de
      // oído: el shell cambia de layout justo por debajo de 1024px.
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
        storageState: 'e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
```

- [ ] **Paso 2: Escribir los ayudantes**

`e2e/helpers.ts`:

```ts
import { expect, type Page } from '@playwright/test';

/**
 * Abre la hoja de captura por donde toque en este ancho: el FAB en móvil, el
 * botón "Añadir" de la barra lateral en escritorio. Los dos abren la misma hoja.
 */
export async function openCapture(page: Page) {
  const fab = page.getByRole('button', { name: 'Añadir tarea o hábito' });

  if (await fab.isVisible()) {
    await fab.click();
  } else {
    await page.getByRole('button', { name: 'Añadir', exact: true }).click();
  }

  await expect(page.getByRole('tab', { name: 'Tarea' })).toBeVisible();
}

export async function createTask(page: Page, title: string) {
  await openCapture(page);
  await page.getByRole('tab', { name: 'Tarea' }).click();
  await page.getByLabel('Título de la tarea').fill(title);
  await page.getByRole('button', { name: 'Añadir tarea' }).click();
  await expect(page.getByRole('tab', { name: 'Tarea' })).toBeHidden();
}

export async function createHabit(page: Page, name: string) {
  await openCapture(page);
  await page.getByRole('tab', { name: 'Hábito' }).click();
  await page.getByLabel('Nombre del hábito').fill(name);
  await page.getByRole('button', { name: 'Crear hábito' }).click();
  await expect(page.getByRole('tab', { name: 'Hábito' })).toBeHidden();
}
```

- [ ] **Paso 3: Rematar el arranque de sesión**

`e2e/auth.setup.ts` — sustituye la espera que dejaste en la Tarea 17 por una que
confirme que el shell se montó:

```ts
  await page.waitForURL('**/inicio', { timeout: 15_000 });
  await expect(
    page.getByRole('navigation', { name: 'Navegación principal' }).first(),
  ).toBeVisible();
```

Deja `expect` en el import.

- [ ] **Paso 4: Reescribir el recorrido de tareas**

`e2e/tasks.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { createTask } from './helpers';

test('crear una tarea, verla en Inicio y completarla', async ({ page }) => {
  await page.goto('/inicio');

  const title = `Tarea E2E ${Date.now()}`;
  await createTask(page, title);

  // La hoja crea con fecha de hoy por defecto, así que cae en "Para hoy".
  await expect(page.getByText(title)).toBeVisible();

  await page
    .getByRole('checkbox', { name: `Completar ${title}` })
    .first()
    .click();

  await page.reload();

  // Ya no está en "Para hoy": ahora vive en "Hechas", tachada.
  const row = page.getByText(title).first();
  await expect(row).toBeVisible();
  await expect(row).toHaveClass(/line-through/);
});

test('el XP del día sube al marcar y la meta no cambia', async ({ page }) => {
  await page.goto('/inicio');

  const title = `XP E2E ${Date.now()}`;
  await createTask(page, title);

  const bar = page.getByRole('progressbar', { name: 'Progreso del día' });
  const before = Number(await bar.getAttribute('aria-valuenow'));

  await page
    .getByRole('checkbox', { name: `Completar ${title}` })
    .first()
    .click();

  await expect
    .poll(async () => Number(await bar.getAttribute('aria-valuenow')))
    .toBeGreaterThan(before);
});

test('el detalle de una tarea abre por enlace directo', async ({ page }) => {
  await page.goto('/tareas');

  const title = `Detalle E2E ${Date.now()}`;
  await createTask(page, title);

  await page.getByRole('link', { name: title }).click();
  await expect(page).toHaveURL(/\/tareas\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  // El mismo enlace, cargado en frío, funciona igual en los dos anchos.
  const url = page.url();
  await page.goto(url);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});
```

- [ ] **Paso 5: Reescribir el recorrido de hábitos**

`e2e/habits.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { createHabit, openCapture } from './helpers';

test('crear un hábito diario, marcarlo y ver la racha en 1', async ({ page }) => {
  await page.goto('/habitos');

  const name = `Hábito E2E ${Date.now()}`;
  await createHabit(page, name);

  const card = page.getByRole('article').filter({ hasText: name });
  await expect(card).toBeVisible();
  await expect(card.getByText('Sin racha')).toBeVisible();

  await card.getByRole('checkbox', { name: `Marcar ${name} hoy` }).click();

  await expect(card.getByText('1 día seguido')).toBeVisible({ timeout: 10_000 });
});

test('un hábito semanal no acumula racha hasta cumplir la meta', async ({ page }) => {
  await page.goto('/habitos');

  const name = `Semanal E2E ${Date.now()}`;

  await openCapture(page);
  await page.getByRole('tab', { name: 'Hábito' }).click();
  await page.getByLabel('Nombre del hábito').fill(name);
  await page.getByRole('button', { name: 'Veces por semana' }).click();
  await page.getByLabel('Veces por semana').fill('3');
  await page.getByRole('button', { name: 'Crear hábito' }).click();

  const card = page.getByRole('article').filter({ hasText: name });
  await card.getByRole('checkbox', { name: `Marcar ${name} hoy` }).click();

  // Una marca de tres: la semana en curso aún no cuenta.
  await expect(card.getByText('Sin racha')).toBeVisible({ timeout: 10_000 });
});

test('el detalle del hábito enseña racha, mes y mejor racha', async ({ page }) => {
  await page.goto('/habitos');

  const name = `Detalle E2E ${Date.now()}`;
  await createHabit(page, name);

  await page.getByRole('link', { name }).click();
  await expect(page).toHaveURL(/\/habitos\/[0-9a-f-]{36}$/);

  await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(page.getByText('Este mes')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Marcar hoy' })).toBeVisible();

  await page.getByRole('button', { name: 'Marcar hoy' }).click();
  await expect(
    page.getByRole('button', { name: /Marcado hoy/ }),
  ).toBeVisible({ timeout: 10_000 });
});
```

- [ ] **Paso 6: Correr los recorridos**

```powershell
npm run test:e2e
```

Esperado: todos verdes en los proyectos `chromium` y `mobile`. Si alguno falla
por un selector, **arregla el selector, no la aserción**: lo que se comprueba
sigue siendo válido.

- [ ] **Paso 7: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `playwright.config.ts`
- `e2e/helpers.ts` (nuevo)
- `e2e/auth.setup.ts`
- `e2e/tasks.spec.ts`
- `e2e/habits.spec.ts`

Mensaje sugerido: `test(pulso): recorridos E2E contra la interfaz nueva`

---

## Tarea 32: Recorridos nuevos de navegación y de tema

**Archivos:**
- Crear: `e2e/navigation.spec.ts`
- Crear: `e2e/theme.spec.ts`

**Interfaces:**
- Consumes: la configuración de dos proyectos de la Tarea 31.

- [ ] **Paso 1: Escribir el recorrido de navegación**

`e2e/navigation.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { createTask } from './helpers';

const DESTINATIONS = [
  { label: 'Inicio', path: '/inicio' },
  { label: 'Tareas', path: '/tareas', heading: 'Tareas' },
  { label: 'Hábitos', path: '/habitos', heading: 'Hábitos' },
  { label: 'Progreso', path: '/progreso', heading: 'Progreso' },
  { label: 'Perfil', path: '/perfil', heading: 'Perfil' },
];

test('los cinco destinos se navegan desde la barra', async ({ page }) => {
  await page.goto('/inicio');

  const nav = page
    .getByRole('navigation', { name: 'Navegación principal' })
    .first();

  for (const destination of DESTINATIONS) {
    await nav.getByRole('link', { name: destination.label }).click();
    await expect(page).toHaveURL(new RegExp(`${destination.path}$`));

    if (destination.heading) {
      await expect(
        page.getByRole('heading', { name: destination.heading, level: 1 }),
      ).toBeVisible();
    }

    // El destino actual queda marcado; sin esto la barra sería decorativa.
    await expect(
      nav.getByRole('link', { name: destination.label }),
    ).toHaveAttribute('aria-current', 'page');
  }
});

test('las rutas viejas siguen abriendo la app', async ({ page }) => {
  // La PWA instalada apunta a /hoy: un 404 ahí sería el peor estreno posible.
  await page.goto('/hoy');
  await expect(page).toHaveURL(/\/inicio$/);

  await page.goto('/ajustes');
  await expect(page).toHaveURL(/\/perfil$/);

  await page.goto('/');
  await expect(page).toHaveURL(/\/inicio$/);
});

test('el FAB sólo aparece donde hay algo que capturar', async ({ page }) => {
  const fab = page.getByRole('button', { name: 'Añadir tarea o hábito' });

  await page.goto('/inicio');
  const onMobile = await fab.isVisible();

  // En escritorio el FAB no existe: su papel lo hace el botón de la barra
  // lateral. La comprobación de dónde aparece sólo tiene sentido en móvil.
  test.skip(!onMobile, 'El FAB es exclusivo del layout móvil');

  await page.goto('/tareas');
  await expect(fab).toBeVisible();

  await page.goto('/habitos');
  await expect(fab).toBeVisible();

  await page.goto('/progreso');
  await expect(fab).toBeHidden();

  await page.goto('/perfil');
  await expect(fab).toBeHidden();
});

test('el maestro-detalle convive con la lista sólo en escritorio', async ({
  page,
}) => {
  await page.goto('/tareas');

  const title = `Maestro E2E ${Date.now()}`;
  await createTask(page, title);

  const listHeading = page.getByRole('heading', { name: 'Tareas', level: 1 });
  await expect(listHeading).toBeVisible();

  await page.getByRole('link', { name: title }).click();
  await expect(page).toHaveURL(/\/tareas\/[0-9a-f-]{36}$/);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  // Es la comprobación del criterio de éxito 2: en escritorio la lista y el
  // panel conviven; en móvil la lista se oculta cuando hay un detalle abierto.
  const width = page.viewportSize()?.width ?? 0;

  if (width >= 1024) {
    await expect(listHeading).toBeVisible();
  } else {
    await expect(listHeading).toBeHidden();
  }
});
```

- [ ] **Paso 2: Escribir el recorrido de tema**

`e2e/theme.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('el tema se alterna y sobrevive a la recarga', async ({ page }) => {
  await page.goto('/perfil');

  const toggle = page.getByRole('switch', { name: /Tema oscuro/ });
  const html = page.locator('html');

  const startedDark = (await toggle.getAttribute('aria-checked')) === 'true';
  if (startedDark) {
    await toggle.click();
    await expect(html).not.toHaveClass(/dark/);
  }

  await toggle.click();
  await expect(html).toHaveClass(/dark/);

  await page.reload();

  // Lo que se comprueba es que no hay parpadeo: la clase ya está puesta cuando
  // la página termina de cargar, porque el script inline corre antes de pintar.
  await expect(html).toHaveClass(/dark/);
  await expect(
    page.getByRole('switch', { name: /Tema oscuro/ }),
  ).toHaveAttribute('aria-checked', 'true');

  // Y sigue puesto al navegar a otra pantalla.
  await page.goto('/inicio');
  await expect(html).toHaveClass(/dark/);

  // Se deja como estaba para no ensuciar los demás recorridos.
  await page.goto('/perfil');
  await page.getByRole('switch', { name: /Tema oscuro/ }).click();
  await expect(html).not.toHaveClass(/dark/);
});
```

- [ ] **Paso 3: Correr todo el conjunto**

```powershell
npm run test:e2e
```

Esperado: todos verdes en `chromium` y en `mobile`. Los `test.skip` de los
recorridos que sólo tienen sentido en un ancho salen marcados como omitidos, no
como fallos.

- [ ] **Paso 4: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `e2e/navigation.spec.ts` (nuevo)
- `e2e/theme.spec.ts` (nuevo)

Mensaje sugerido: `test(pulso): navegación en ambos anchos y persistencia del tema`

---

## Tarea 33: Auditoría de contraste y cierre

**Archivos:**
- Modificar: `app/globals.css` sólo si la auditoría lo exige
- Modificar: `docs/superpowers/specs/2026-08-04-pulso-shell-design.md` (marcar
  el estado)

**Esta tarea no añade funcionalidad.** Comprueba los cinco criterios de éxito
del spec con evidencia, no de oído.

- [ ] **Paso 1: Medir el contraste de verdad**

```powershell
npm run dev
```

Abre `/inicio`, activa el tema oscuro desde `/perfil` y pega esto en la consola
de DevTools:

```js
const luminance = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((part) => {
    const channel = parseInt(part, 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi + 0.05) / (lo + 0.05)).toFixed(2);
};

const read = (name) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

const surface = read('--pulso-surface');
const elevated = read('--pulso-surface-elevated');
const feature = read('--pulso-surface-feature');

console.table([
  ['text / surface', ratio(read('--pulso-text'), surface)],
  ['text-soft / surface', ratio(read('--pulso-text-soft'), surface)],
  ['text-muted / surface', ratio(read('--pulso-text-muted'), surface)],
  ['text / elevated', ratio(read('--pulso-text'), elevated)],
  ['text-soft / elevated', ratio(read('--pulso-text-soft'), elevated)],
  ['text-muted / elevated', ratio(read('--pulso-text-muted'), elevated)],
  ['on-feature / feature', ratio('#FFFFFF', feature)],
  ['on-feature-soft / feature', ratio('#B9A9E0', feature)],
  ['positive / feature', ratio('#67E8A0', feature)],
]);
```

**Umbral: 4.5 en todas las filas.** Repite con el tema claro. Anota los nueve
valores de cada tema.

- [ ] **Paso 2: Corregir sólo si alguna fila baja de 4.5**

Si algún par falla, sube el token en `app/globals.css` hasta pasar y **vuelve a
medir**. No cambies el componente: el arreglo va en el token, que es lo que
hace que corregir el tema sea editar un archivo y no cada componente.

Si nada falla, no toques nada. Un cambio "por si acaso" invalidaría las medidas
que acabas de tomar.

- [ ] **Paso 3: Comprobar los acentos como texto**

En cualquier pantalla, busca texto pintado con `text-accent`,
`text-accent-warm` o `text-positive` que sea contenido esencial y menor de 24px.

Las reglas de uso de color del [README](README.md#reglas-de-uso-de-color-no-negociables):
`accent` da 4.0:1 sobre claro, `accent-warm` 2.8:1, `positive` 1.5:1. Los tres
son válidos como relleno y como texto grande; ninguno lo es como cuerpo de
texto.

Lo que sí es correcto y debe quedarse: los mensajes de error en
`text-accent-warm` **siempre van acompañados** del estado del control, así que el
color no es el único portador de la información. Si encuentras un caso donde el
color es lo único que distingue un estado, cámbialo a `text-text` y añade un
icono o una palabra.

- [ ] **Paso 4: Recorrer las siete pantallas a 390px**

Con las DevTools en 390 × 844, visita `/inicio`, `/tareas`, `/tareas/<id>`,
`/habitos`, `/habitos/<id>`, `/progreso` y `/perfil`.

En cada una:

- Nada desborda horizontalmente. Las filas de chips se desplazan; la página no.
- La barra inferior no tapa contenido: el último elemento se ve entero.
- Los objetivos táctiles llegan a 44px.
- En tema oscuro no hay ningún recuadro que se funda con el fondo.

- [ ] **Paso 5: Comprobar que las primitivas no conocen el dominio**

Es el criterio de éxito 5, y se verifica leyendo el grafo de importaciones:

```powershell
Select-String -Path "components\ui\*.tsx" -Pattern "@/features" -List
```

Esperado: **ninguna coincidencia**. Si sale alguna, esa primitiva tendrá que
rehacerse en el bloque 2, que es justo lo que el criterio quiere evitar.

- [ ] **Paso 6: Comprobar que ningún número es inventado**

```powershell
Select-String -Path "app\**\*.tsx","features\**\*.tsx" -Pattern "1800|1\.800" -List
```

Esperado: ninguna coincidencia. La meta fija de 1.800 XP del prototipo sólo
funciona con datos falsos; si aparece, alguien la coló.

Revisa además que ninguna pantalla pinte logros, retos mensuales ni un saldo de
XP que no se pierde: es estado almacenado y pertenece al bloque 4.

- [ ] **Paso 7: Batería completa, la última**

```powershell
npm run test; if ($?) { npm run typecheck }; if ($?) { npm run lint }; if ($?) { npm run build }; if ($?) { npm run test:e2e }
```

Esperado: los cinco verdes. Copia la salida: es la evidencia del cierre.

- [ ] **Paso 8: Marcar el spec como implementado**

`docs/superpowers/specs/2026-08-04-pulso-shell-design.md` — en la cabecera,
cambia la línea de estado:

```markdown
**Estado:** implementado (plan `docs/superpowers/plans/2026-08-04-pulso-shell/`)
```

- [ ] **Paso 9: Cierre — repasar los cinco criterios**

Escribe al autor una nota con una línea por criterio y su evidencia:

1. **Las siete pantallas son reconocibles como el prototipo a 390px** — recorrido
   del Paso 4.
2. **Barra lateral y maestro-detalle funcionan; el enlace directo abre bien en
   ambos anchos** — `e2e/navigation.spec.ts` y `e2e/tasks.spec.ts` en los
   proyectos `chromium` y `mobile`.
3. **Ningún número en pantalla es inventado** — comprobaciones contra la base de
   las Tareas 21, 26 y 27, más el Paso 6.
4. **En tema oscuro no hay ningún par de texto por debajo de AA** — las nueve
   medidas del Paso 1.
5. **Los bloques 2 a 5 no obligan a rehacer las primitivas** — Paso 5.

Si alguno no se puede afirmar con evidencia, **dilo**, no lo des por bueno.

- [ ] **Paso 10: Reportar al autor**

**No ejecutes git.** Archivos tocados:

- `docs/superpowers/specs/2026-08-04-pulso-shell-design.md`
- `app/globals.css` (sólo si el Paso 2 lo exigió)

Mensaje sugerido: `docs(pulso): marcar el spec como implementado tras la auditoría`

---

## Fin del plan

Los bloques 2 a 5 —tareas ricas, hábitos cuantitativos, gamificación persistente
y calendario— tendrán su propio spec y su propio plan. Nada de lo que se
construyó aquí debería tener que rehacerse para ellos.

← [README](README.md)

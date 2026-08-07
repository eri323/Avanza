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

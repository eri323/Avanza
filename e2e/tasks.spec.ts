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

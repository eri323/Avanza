import { expect, test } from '@playwright/test';

test('crear una tarea, verla en Hoy y completarla', async ({ page }) => {
  await page.goto('/hoy');
  await expect(page.getByRole('heading', { name: 'Hoy' })).toBeVisible();

  const title = `Tarea E2E ${Date.now()}`;
  const today = new Date().toISOString().slice(0, 10);

  await page.getByPlaceholder('¿Qué hay que hacer?').fill(title);
  await page.getByLabel('Fecha límite').fill(today);
  await page.getByRole('button', { name: 'Añadir' }).click();

  await expect(page.getByText(title)).toBeVisible();

  await page.getByRole('checkbox', { name: `Completar ${title}` }).check();

  await page.reload();
  await expect(page.getByText(title)).toHaveCount(0);
});

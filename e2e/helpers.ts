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

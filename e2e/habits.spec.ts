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

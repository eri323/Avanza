import { expect, test } from '@playwright/test';

test('crear un hábito diario, marcarlo y ver la racha en 1', async ({ page }) => {
  await page.goto('/habitos');
  await expect(page.getByRole('heading', { name: 'Hábitos' })).toBeVisible();

  const name = `Hábito E2E ${Date.now()}`;

  await page.getByPlaceholder('Nuevo hábito').fill(name);
  await page.getByRole('button', { name: 'Crear' }).click();

  const card = page.getByRole('article').filter({ hasText: name });
  await expect(card).toBeVisible();
  await expect(card.getByText('Sin racha')).toBeVisible();

  await card.getByRole('button', { name: `Marcar ${name} hoy` }).click();

  await expect(card.getByText('1 día seguido')).toBeVisible({ timeout: 10_000 });
});

test('un hábito semanal no acumula racha hasta cumplir la meta', async ({ page }) => {
  await page.goto('/habitos');

  const name = `Semanal E2E ${Date.now()}`;

  await page.getByPlaceholder('Nuevo hábito').fill(name);
  await page.getByLabel('Cadencia').selectOption('weekly');
  await page.getByLabel('Veces por semana').fill('3');
  await page.getByRole('button', { name: 'Crear' }).click();

  const card = page.getByRole('article').filter({ hasText: name });
  await card.getByRole('button', { name: `Marcar ${name} hoy` }).click();

  // Una marca de tres: la semana en curso aún no cuenta.
  await expect(card.getByText('Sin racha')).toBeVisible({ timeout: 10_000 });
});

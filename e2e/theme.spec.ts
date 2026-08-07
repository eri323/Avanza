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

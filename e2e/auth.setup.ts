import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = 'e2e/.auth/user.json';

/**
 * Registra un usuario nuevo en cada corrida, pasando por la interfaz real.
 *
 * No se fabrica la sesión a mano: `@supabase/ssr` la guarda en cookies escritas
 * por el servidor, así que sembrar `localStorage` desde el test no autentica
 * nada. Registrarse por la UI produce exactamente las cookies que la app usa.
 *
 * Un correo distinto por ejecución aísla los datos entre corridas sin limpiar
 * la base: RLS garantiza que cada usuario sólo vea lo suyo.
 */
setup('registrar usuario de prueba', async ({ page }) => {
  const email = `e2e-${Date.now()}@avanza.test`;
  const password = 'avanza-e2e-password';

  await page.goto('/login');
  await page.getByRole('button', { name: 'Usar contraseña' }).click();

  await page.getByLabel('Correo').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();

  await page.waitForURL('**/inicio', { timeout: 15_000 });

  await page.context().storageState({ path: AUTH_FILE });
});

/**
 * Tres tramos y no cuatro: "buenas madrugadas" no existe y a las 3 de la
 * mañana lo correcto en español es seguir dando las buenas noches.
 */
export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Buenos días';
  if (hour >= 12 && hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

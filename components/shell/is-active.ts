/**
 * Un destino está activo en su ruta y en sus subrutas. La barra comparando por
 * `startsWith` a secas marcaría `/progreso` estando en `/proyectos`; la barra
 * es el sitio donde ese error se ve todo el rato.
 */
export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

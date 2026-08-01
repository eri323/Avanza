import Link from 'next/link';

const LINKS = [
  { href: '/hoy', label: 'Hoy' },
  { href: '/tareas', label: 'Tareas' },
  { href: '/habitos', label: 'Hábitos' },
  { href: '/proyectos', label: 'Proyectos' },
  { href: '/ajustes', label: 'Ajustes' },
];

export function Nav() {
  return (
    <nav className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <ul className="mx-auto flex max-w-2xl gap-1 overflow-x-auto px-4 py-2">
        {LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="block whitespace-nowrap rounded-md px-3 py-1.5 text-sm hover:bg-neutral-100"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

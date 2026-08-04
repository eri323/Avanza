import type { Metadata, Viewport } from 'next';
import { Nav } from './nav';
import { ServiceWorkerRegistration } from './service-worker-registration';
import './globals.css';

export const metadata: Metadata = {
  title: 'Avanza',
  description: 'Tus tareas y hábitos en un solo lugar.',
};

export const viewport: Viewport = {
  themeColor: '#171717',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased">
        <Nav />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}

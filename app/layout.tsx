import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { Nav } from './nav';
import { ServiceWorkerRegistration } from './service-worker-registration';
import { ThemeScript } from './theme-script';
import './globals.css';

// Variable: un solo archivo cubre 400–800 sin pedir seis pesos al CDN.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
});

export const metadata: Metadata = {
  title: 'Avanza',
  description: 'Tus tareas y hábitos en un solo lugar.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FBF7FF' },
    { media: '(prefers-color-scheme: dark)', color: '#150C28' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={bricolage.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-dvh bg-surface font-sans text-body text-text antialiased">
        <Nav />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}

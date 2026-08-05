import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Avanza',
    short_name: 'Avanza',
    description: 'Tus tareas y hábitos en un solo lugar.',
    start_url: '/inicio',
    display: 'standalone',
    background_color: '#FBF7FF',
    theme_color: '#FBF7FF',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}

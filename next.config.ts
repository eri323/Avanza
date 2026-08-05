import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * `/hoy` y `/ajustes` fueron las rutas de la v1 y la PWA instalada apunta a
   * la primera. Permanentes y no temporales: son un cambio de nombre definitivo,
   * y un 308 deja que el navegador deje de pedirlas.
   */
  async redirects() {
    return [
      { source: '/hoy', destination: '/inicio', permanent: true },
      { source: '/ajustes', destination: '/perfil', permanent: true },
    ];
  },
};

export default nextConfig;

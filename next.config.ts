import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Enquanto o módulo "Início" não existe, a raiz leva para a agenda.
  async redirects() {
    return [
      { source: "/", destination: "/agenda", permanent: false },
      { source: "/admin", destination: "/admin/eventos", permanent: false },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const urlBackend = process.env.BACKEND_URL ?? "http://localhost:3333";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [{ source: "/api/:caminho*", destination: `${urlBackend}/api/:caminho*` }];
  },
};

export default nextConfig;

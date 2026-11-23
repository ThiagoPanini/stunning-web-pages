import type { NextConfig } from "next";

// Export estático: o build gera arquivos e recusa recurso de servidor (ADR 0006).
const nextConfig: NextConfig = {
  output: "export",
  // Cache Components e o prefetch parcial não funcionam com export no Next 16.4.6.
  cacheComponents: false,
  partialPrefetching: false,
  // Sem isto o HTML aponta para /_next/image, rota que não existe no export.
  images: { unoptimized: true },
  reactCompiler: true,
  typedRoutes: true,
};

export default nextConfig;

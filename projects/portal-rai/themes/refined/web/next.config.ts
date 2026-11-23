import type { NextConfig } from "next";

// Static export: the build writes files and refuses server features (ADR 0006).
const nextConfig: NextConfig = {
  output: "export",
  // Cache Components and partial prefetching do not work with export in Next 16.4.6.
  cacheComponents: false,
  partialPrefetching: false,
  // Without this the HTML points to /_next/image, a route the export does not have.
  images: { unoptimized: true },
  reactCompiler: true,
  typedRoutes: true,
};

export default nextConfig;

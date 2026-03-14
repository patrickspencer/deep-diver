import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  turbopack: {
    root: __dirname,
    resolveAlias: {
      canvas: { browser: "" },
    },
  },
};

export default nextConfig;

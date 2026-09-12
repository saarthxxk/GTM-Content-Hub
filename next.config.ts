import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly — without this, Next.js/Turbopack can
  // mis-detect the root when a parent directory also has a lockfile, which
  // otherwise emits a build warning and can break relative file resolution.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

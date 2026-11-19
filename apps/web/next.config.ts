import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  // Self-contained server output for the Docker image (see Dockerfile.web)
  output: "standalone",
  // Trace files from the monorepo root so the standalone build includes hoisted deps
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;

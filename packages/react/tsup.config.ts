import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react"],
  // Components use hooks: mark the bundle as client code for Next.js App Router
  banner: { js: '"use client";' },
});

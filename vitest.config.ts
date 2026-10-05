import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Variables de la base de pruebas (Postgres desechable en 127.0.0.1:5433).
process.loadEnvFile(path.resolve(dirname, ".env.test"));

export default defineConfig({
  resolve: {
    alias: {
      "@payload-config": path.resolve(dirname, "src/payload.config.ts"),
      "@": path.resolve(dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    // Los tests de integración comparten una sola base: sin paralelismo entre archivos.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
    globalSetup: ["tests/integration/global-setup.ts"],
    server: { deps: { inline: ["payload", /@payloadcms\//] } },
  },
});

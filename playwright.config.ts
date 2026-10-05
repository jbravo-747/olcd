import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, devices } from "@playwright/test";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// La app de pruebas E2E corre en el host (Next dev, puerto 3001) contra la base
// olcd_e2e del Postgres desechable. Variables en .env.e2e.
process.loadEnvFile(path.resolve(dirname, ".env.e2e"));

const baseURL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "tests/e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "tests/e2e/.report" }]],
  outputDir: "tests/e2e/.results",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    locale: "es-MX",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    { name: "movil", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Next relanza un proceso hijo copiando execArgv, y rechaza --env-file en
    // NODE_OPTIONS; las variables ya están en process.env por loadEnvFile arriba.
    command: "node_modules/.bin/next dev -p 3001",
    url: `${baseURL}/es`,
    reuseExistingServer: true,
    timeout: 180_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * Siembra la base olcd_e2e antes de la suite. El seed es idempotente: si ya
 * hay labs sale con 0 sin tocar nada. Con NODE_ENV=development Payload hace
 * `push` del esquema en el primer arranque, así que sirve sobre una base vacía.
 */
export default function configuracionGlobal() {
  const inicio = Date.now();
  const resultado = spawnSync(process.execPath, ["--env-file=.env.e2e", "--import", "tsx", "src/seed/index.ts"], {
    cwd: raiz,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    timeout: 5 * 60_000,
  });
  const segundos = ((Date.now() - inicio) / 1000).toFixed(1);
  if (resultado.status !== 0) {
    throw new Error(
      `El seed E2E falló (código ${resultado.status}, ${segundos}s).\n--- stdout ---\n${resultado.stdout}\n--- stderr ---\n${resultado.stderr}`,
    );
  }
  console.log(`[e2e] Seed listo en ${segundos}s`);
}

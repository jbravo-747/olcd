/**
 * Prepara la base de pruebas (DATABASE_URI de .env.test) antes de correr Vitest:
 * borra el esquema `public` y lo reconstruye con las migraciones de src/migrations,
 * igual que arrancaría producción (NODE_ENV=test → `push` desactivado).
 *
 * Corre en el proceso principal de Vitest; los archivos de test abren su propia
 * instancia de Payload (ver helpers.ts).
 */
import { Client } from "pg";
import { getPayload, type Migration } from "payload";
import config from "@payload-config";
import { migrations } from "@/migrations";
import { cerrarPool } from "./helpers";

export default async function setup() {
  const connectionString = process.env.DATABASE_URI;
  if (!connectionString) throw new Error("DATABASE_URI no está definida (¿cargó .env.test?)");

  const cliente = new Client({ connectionString });
  await cliente.connect();
  try {
    await cliente.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  } finally {
    await cliente.end();
  }

  const payload = await getPayload({ config });
  try {
    // El tipo `Migration` de Payload declara `up/down(args: unknown)`; las migraciones
    // generadas tipan `MigrateUpArgs`, de ahí el cast (es la misma lista de prodMigrations).
    await payload.db.migrate({ migrations: migrations as unknown as Migration[] });
  } finally {
    await cerrarPool(payload);
  }

  return async () => {
    // Cada archivo de test cierra su propia conexión (helpers.registrarCierre).
  };
}

/**
 * Utilidades compartidas por los tests de integración. Cada archivo de test usa
 * una única instancia de Payload (obtenerPayload) y la cierra al final
 * (registrarCierre) para que Vitest pueda terminar el proceso.
 */
import { afterAll } from "vitest";
import { Client } from "pg";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import type { User } from "@/payload-types";

let instancia: Promise<Payload> | null = null;

export function obtenerPayload(): Promise<Payload> {
  instancia ??= getPayload({ config });
  return instancia;
}

type ClientePg = { release?: (err?: Error) => void };
type PoolPg = { end(): Promise<void>; _clients: ClientePg[]; _idle: { client: ClientePg }[] };

/**
 * Cierra el pool de pg de una instancia de Payload. `payload.db.destroy()` no
 * cierra el pool, y `pool.end()` nunca resuelve porque el adaptador deja un
 * cliente reservado al conectar; por eso se liberan primero los clientes en uso.
 */
export async function cerrarPool(payload: Payload) {
  const pool = (payload.db as unknown as { pool?: PoolPg }).pool;
  if (pool) {
    const ociosos = new Set(pool._idle.map((i) => i.client));
    for (const cliente of pool._clients) if (!ociosos.has(cliente)) cliente.release?.();
    await pool.end();
  }
  await payload.db.destroy?.();
  // getPayload cachea la instancia en global; sin esto otro archivo del mismo
  // worker reutilizaría un pool ya cerrado.
  (globalThis as { _payload?: Map<string, unknown> })._payload?.clear();
}

export async function cerrarPayload() {
  if (!instancia) return;
  const payload = await instancia;
  instancia = null;
  await cerrarPool(payload);
}

/** Registra el cierre de Payload al terminar el archivo de test. */
export function registrarCierre() {
  afterAll(async () => {
    await cerrarPayload();
  });
}

let contador = 0;
export const correoUnico = (prefijo = "u") => `${prefijo}-${Date.now()}-${++contador}@pruebas.test`;

export const CONTRASENA = "Contrasena-de-pruebas-1";

/** Crea un usuario saltándose el control de acceso y devuelve el documento. */
export async function crearUsuario(rol: User["rol"], datos: Partial<{ email: string; nombre: string }> = {}) {
  const payload = await obtenerPayload();
  return payload.create({
    collection: "users",
    data: {
      email: datos.email ?? correoUnico(rol),
      password: CONTRASENA,
      nombre: datos.nombre ?? `Usuario ${rol}`,
      rol,
    },
    overrideAccess: true,
  });
}

/** Opciones para operar la Local API con el control de acceso activo. */
export const como = (user: User) => ({ overrideAccess: false as const, user });
export const comoAnonimo = () => ({ overrideAccess: false as const, user: null });

/** Vacía todas las tablas salvo la de migraciones (reinicia las secuencias). */
export async function limpiar() {
  const cliente = new Client({ connectionString: process.env.DATABASE_URI });
  await cliente.connect();
  try {
    const { rows } = await cliente.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'payload_migrations'",
    );
    if (rows.length === 0) return;
    const tablas = rows.map((r) => `"${r.tablename}"`).join(", ");
    await cliente.query(`TRUNCATE TABLE ${tablas} RESTART IDENTITY CASCADE`);
  } finally {
    await cliente.end();
  }
}

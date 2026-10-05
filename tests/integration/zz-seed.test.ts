/**
 * S4 · Seed (src/seed/index.ts) ejecutado como proceso hijo, igual que
 * `npm run seed` pero con .env.test. Sobre una base vacía carga el contenido
 * de la maqueta en ambos idiomas y crea el admin; sobre una base con contenido
 * no toca nada.
 */
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { beforeAll, describe, expect, it } from "vitest";
import { limpiar, obtenerPayload, registrarCierre } from "./helpers";

const ejecutar = promisify(execFile);
const RAIZ = path.resolve(__dirname, "../..");
const ADMIN = { SEED_ADMIN_EMAIL: "admin@pruebas.test", SEED_ADMIN_PASSWORD: "Admin-de-pruebas-1" };
const TIEMPO = 180_000;

registrarCierre();

async function correrSeed() {
  try {
    const { stdout, stderr } = await ejecutar(
      process.execPath,
      ["--env-file=.env.test", "--import", "tsx", "src/seed/index.ts"],
      { cwd: RAIZ, env: { ...process.env, ...ADMIN }, timeout: TIEMPO - 10_000, maxBuffer: 16 * 1024 * 1024 },
    );
    return { codigo: 0, salida: stdout + stderr };
  } catch (error) {
    const e = error as { code?: number; stdout?: string; stderr?: string };
    return { codigo: e.code ?? 1, salida: `${e.stdout ?? ""}${e.stderr ?? ""}` };
  }
}

const COLECCIONES = [
  "labs",
  "proyectos",
  "publicaciones",
  "entradas",
  "noticias",
  "centros",
  "personas",
  "organizaciones",
  "categorias",
  "users",
] as const;

async function contar() {
  const payload = await obtenerPayload();
  const conteos: Record<string, number> = {};
  for (const collection of COLECCIONES) {
    conteos[collection] = (await payload.count({ collection, overrideAccess: true })).totalDocs;
  }
  return conteos;
}

beforeAll(async () => {
  await limpiar();
});

describe("S4 · seed", () => {
  let conteosPrimeraCorrida: Record<string, number>;

  it("sobre una base vacía termina con 0 y carga contenido en todas las colecciones", { timeout: TIEMPO }, async () => {
    const { codigo, salida } = await correrSeed();
    expect(codigo, salida).toBe(0);
    conteosPrimeraCorrida = await contar();
    for (const collection of COLECCIONES) expect(conteosPrimeraCorrida[collection], collection).toBeGreaterThan(0);
  });

  it("crea el usuario admin indicado con rol admin", async () => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({ collection: "users", overrideAccess: true });
    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({ email: ADMIN.SEED_ADMIN_EMAIL, rol: "admin" });
  });

  it("el admin puede iniciar sesión con la contraseña indicada", async () => {
    const payload = await obtenerPayload();
    const { user } = await payload.login({
      collection: "users",
      data: { email: ADMIN.SEED_ADMIN_EMAIL, password: ADMIN.SEED_ADMIN_PASSWORD },
    });
    expect(user?.rol).toBe("admin");
  });

  it("carga el contenido en inglés con el prefijo [EN]", async () => {
    const payload = await obtenerPayload();
    const en = await payload.find({ collection: "publicaciones", locale: "en", limit: 5, overrideAccess: true });
    expect(en.docs.length).toBeGreaterThan(0);
    for (const doc of en.docs) expect(doc.titulo).toMatch(/^\[EN\] /);
    const es = await payload.find({ collection: "publicaciones", locale: "es", limit: 5, overrideAccess: true });
    for (const doc of es.docs) expect(doc.titulo).not.toMatch(/^\[EN\] /);
  });

  it("rellena los textos del sitio en ambos idiomas", async () => {
    const payload = await obtenerPayload();
    const es = await payload.findGlobal({ slug: "sitio", locale: "es", overrideAccess: true });
    const en = await payload.findGlobal({ slug: "sitio", locale: "en", overrideAccess: true });
    expect(es.inicio?.texto).toBeTruthy();
    expect(en.inicio?.texto).toMatch(/^\[EN\] /);
  });

  it("una segunda corrida termina con 0 y no cambia ningún conteo", { timeout: TIEMPO }, async () => {
    const { codigo, salida } = await correrSeed();
    expect(codigo, salida).toBe(0);
    expect(await contar()).toEqual(conteosPrimeraCorrida);
  });

  // Auditoría Q-6 corregida: el seed crea el admin aunque ya haya contenido.
  it("crea el admin aunque ya exista contenido (base restaurada)", { timeout: TIEMPO }, async () => {
    const payload = await obtenerPayload();
    await payload.delete({ collection: "users", where: {}, overrideAccess: true });
    const { codigo } = await correrSeed();
    expect(codigo).toBe(0);
    const { totalDocs } = await payload.count({ collection: "users", overrideAccess: true });
    expect(totalDocs).toBe(1);
  });
});

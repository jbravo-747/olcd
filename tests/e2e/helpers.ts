import type { APIRequestContext, Page } from "@playwright/test";
import { expect, request as crearRequest } from "@playwright/test";
import { enlacesLegales, navegacion } from "../../src/lib/navegacion";
import es from "../../src/messages/es.json" with { type: "json" };
import en from "../../src/messages/en.json" with { type: "json" };

export type Locale = "es" | "en";
export const locales: Locale[] = ["es", "en"];
export const mensajes = { es, en } as const;

export const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001";
export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@pruebas.olcd";
export const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Pruebas-OLCD-2026!";

/** Rutas públicas estáticas (sin locale, sin fragmento #). */
export const rutasEstaticas: string[] = Array.from(
  new Set(
    [
      "/",
      ...navegacion.flatMap((item) => [item.href, ...(item.hijos ?? []).map((h) => h.href)]),
      "/contacto",
      "/buscador-de-noticias",
      "/mapa-de-centros-de-datos",
      ...enlacesLegales.map((e) => e.href),
    ].map((href) => href.split("#")[0]),
  ),
);

/** Inicia sesión en Payload por REST y devuelve el token JWT. */
export async function tokenAdmin(request: APIRequestContext): Promise<string> {
  const respuesta = await request.post(`${BASE_URL}/api/users/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(respuesta.status(), "login admin por REST").toBe(200);
  const cuerpo = await respuesta.json();
  expect(cuerpo.token, "token JWT del admin").toBeTruthy();
  return cuerpo.token as string;
}

/** Contexto de peticiones ya autenticado como admin (cabecera Authorization: JWT). */
export async function contextoAdmin(): Promise<{ api: APIRequestContext; token: string }> {
  const anonimo = await crearRequest.newContext({ baseURL: BASE_URL });
  const token = await tokenAdmin(anonimo);
  await anonimo.dispose();
  const api = await crearRequest.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: { Authorization: `JWT ${token}` },
  });
  return { api, token };
}

/** Primer documento de una colección vía REST (depth configurable). */
export async function primerDocumento<T = Record<string, unknown>>(
  request: APIRequestContext,
  coleccion: string,
  depth = 0,
  extra = "",
): Promise<T> {
  const respuesta = await request.get(`${BASE_URL}/api/${coleccion}?limit=1&depth=${depth}${extra}`);
  expect(respuesta.status(), `GET /api/${coleccion}`).toBe(200);
  const { docs } = await respuesta.json();
  expect(docs?.length, `hay al menos un documento en ${coleccion}`).toBeGreaterThan(0);
  return docs[0] as T;
}

/** Rutas de detalle (una por tipo), descubiertas por la API REST. */
export async function rutasDeDetalle(request: APIRequestContext): Promise<string[]> {
  const lab = await primerDocumento<{ slug: string }>(request, "labs");
  const proyecto = await primerDocumento<{ slug: string; lab: { slug: string } }>(request, "proyectos", 1);
  const publicacion = await primerDocumento<{ slug: string }>(request, "publicaciones");
  const entrada = await primerDocumento<{ slug: string }>(request, "entradas");
  const persona = await primerDocumento<{ slug: string }>(request, "personas");
  const organizacion = await primerDocumento<{ slug: string }>(request, "organizaciones");
  return [
    `/ejes-de-trabajo/${lab.slug}`,
    `/ejes-de-trabajo/${proyecto.lab.slug}/${proyecto.slug}`,
    `/publicaciones/${publicacion.slug}`,
    `/actualidad/${entrada.slug}`,
    `/quienes-somos/personas/${persona.slug}`,
    `/quienes-somos/organizaciones/${organizacion.slug}`,
  ];
}

/** Recolecta errores de página y de consola; se asertan al final del test. */
export function vigilarErrores(page: Page) {
  const errores: string[] = [];
  page.on("pageerror", (error) => errores.push(`pageerror: ${error.message}`));
  page.on("console", (mensaje) => {
    if (mensaje.type() === "error") errores.push(`console.error: ${mensaje.text()}`);
  });
  return errores;
}

/** PNG válido de 1x1 píxel (transparente). */
export const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

/** PDF mínimo válido (una página en blanco). */
export const PDF_MINIMO = Buffer.from(
  [
    "%PDF-1.4",
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 200] >> endobj",
    "xref",
    "0 4",
    "0000000000 65535 f ",
    "0000000009 00000 n ",
    "0000000058 00000 n ",
    "0000000115 00000 n ",
    "trailer << /Size 4 /Root 1 0 R >>",
    "startxref",
    "190",
    "%%EOF",
    "",
  ].join("\n"),
  "utf8",
);

/** Sufijo único por ejecución para slugs y asuntos. */
export const sufijoUnico = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

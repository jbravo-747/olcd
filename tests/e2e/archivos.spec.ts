import { expect, test, type APIRequestContext } from "@playwright/test";
import { BASE_URL, contextoAdmin, PDF_MINIMO, PNG_1X1, sufijoUnico } from "./helpers";

/**
 * E6 - Subida de archivos por la API REST como admin: `media` sólo acepta
 * imágenes y `documentos` sólo PDF. Los documentos creados se borran al final.
 */

test.describe("archivos por REST (media y documentos)", () => {
  let api: APIRequestContext;
  const creados: { coleccion: string; id: number | string }[] = [];

  test.beforeAll(async () => {
    ({ api } = await contextoAdmin());
  });

  test.afterAll(async () => {
    for (const { coleccion, id } of creados) {
      await api.delete(`/api/${coleccion}/${id}`);
    }
    await api.dispose();
  });

  test("POST /api/media con PNG y alt crea la imagen y su URL sirve image/png", async () => {
    const respuesta = await api.post("/api/media", {
      multipart: {
        file: { name: `e2e-${sufijoUnico()}.png`, mimeType: "image/png", buffer: PNG_1X1 },
        _payload: JSON.stringify({ alt: "Píxel de prueba E2E" }),
      },
    });
    expect(respuesta.status(), await respuesta.text()).toBe(201);
    const { doc } = await respuesta.json();
    creados.push({ coleccion: "media", id: doc.id });
    expect(doc.alt).toBe("Píxel de prueba E2E");
    expect(doc.mimeType).toBe("image/png");
    expect(doc.url).toBeTruthy();

    const url = doc.url.startsWith("http") ? doc.url : `${BASE_URL}${doc.url}`;
    const archivo = await api.get(url);
    expect(archivo.status()).toBe(200);
    expect(archivo.headers()["content-type"]).toMatch(/^image\/png/);
  });

  test("POST /api/media con .txt es rechazado (4xx)", async () => {
    const respuesta = await api.post("/api/media", {
      multipart: {
        file: { name: "no-es-imagen.txt", mimeType: "text/plain", buffer: Buffer.from("hola", "utf8") },
        _payload: JSON.stringify({ alt: "Texto que no debería entrar" }),
      },
    });
    expect(respuesta.status()).toBeGreaterThanOrEqual(400);
    expect(respuesta.status()).toBeLessThan(500);
    if (respuesta.status() === 201) creados.push({ coleccion: "media", id: (await respuesta.json()).doc.id });
  });

  test("POST /api/media sin alt es rechazado (campo obligatorio)", async () => {
    const respuesta = await api.post("/api/media", {
      multipart: {
        file: { name: `e2e-sin-alt-${sufijoUnico()}.png`, mimeType: "image/png", buffer: PNG_1X1 },
        _payload: JSON.stringify({}),
      },
    });
    expect(respuesta.status()).toBe(400);
    if (respuesta.status() === 201) creados.push({ coleccion: "media", id: (await respuesta.json()).doc.id });
  });

  test("POST /api/documentos con PDF y título crea el documento", async () => {
    const respuesta = await api.post("/api/documentos", {
      multipart: {
        file: { name: `e2e-${sufijoUnico()}.pdf`, mimeType: "application/pdf", buffer: PDF_MINIMO },
        _payload: JSON.stringify({ titulo: "PDF de prueba E2E" }),
      },
    });
    expect(respuesta.status(), await respuesta.text()).toBe(201);
    const { doc } = await respuesta.json();
    creados.push({ coleccion: "documentos", id: doc.id });
    expect(doc.titulo).toBe("PDF de prueba E2E");
    expect(doc.mimeType).toBe("application/pdf");

    const url = doc.url.startsWith("http") ? doc.url : `${BASE_URL}${doc.url}`;
    const archivo = await api.get(url);
    expect(archivo.status()).toBe(200);
    expect(archivo.headers()["content-type"]).toMatch(/^application\/pdf/);
  });

  test("POST /api/documentos con PNG es rechazado (4xx)", async () => {
    const respuesta = await api.post("/api/documentos", {
      multipart: {
        file: { name: "imagen.png", mimeType: "image/png", buffer: PNG_1X1 },
        _payload: JSON.stringify({ titulo: "Imagen donde va un PDF" }),
      },
    });
    expect(respuesta.status()).toBeGreaterThanOrEqual(400);
    expect(respuesta.status()).toBeLessThan(500);
    if (respuesta.status() === 201) creados.push({ coleccion: "documentos", id: (await respuesta.json()).doc.id });
  });

  test("sin sesión no se puede subir a media", async ({ request }) => {
    const respuesta = await request.post("/api/media", {
      multipart: {
        file: { name: "anonimo.png", mimeType: "image/png", buffer: PNG_1X1 },
        _payload: JSON.stringify({ alt: "anónimo" }),
      },
    });
    expect([401, 403]).toContain(respuesta.status());
  });
});

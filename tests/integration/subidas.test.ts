/**
 * S3 · Validación de archivos subidos a `media` (sólo imágenes) y
 * `documentos` (sólo PDF) a través de la Local API con `file`.
 * Sin S3_BUCKET los archivos se escriben en ./media y ./documentos; se borran
 * al final junto con los documentos creados.
 */
import { existsSync, readdirSync, rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { limpiar, obtenerPayload, registrarCierre } from "./helpers";

// PNG de 1×1 píxel (transparente), el archivo PNG válido más pequeño habitual.
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

// PDF mínimo escrito a mano: una página vacía, sin flujos de contenido.
const PDF_MINIMO = Buffer.from(
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
  ].join("\n"),
);

const SVG = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>');

const archivo = (data: Buffer, mimetype: string, name: string) => ({ data, mimetype, name, size: data.length });

const INVALIDO = { status: 400 };

registrarCierre();

beforeAll(async () => {
  await limpiar();
});

afterAll(async () => {
  const payload = await obtenerPayload();
  await payload.delete({ collection: "media", where: {}, overrideAccess: true });
  await payload.delete({ collection: "documentos", where: {}, overrideAccess: true });
  for (const carpeta of ["media", "documentos"]) {
    if (existsSync(carpeta) && readdirSync(carpeta).length === 0) rmSync(carpeta, { recursive: true });
  }
});

describe("S3 · media (imágenes)", () => {
  it("acepta un PNG y genera los tamaños configurados", async () => {
    const payload = await obtenerPayload();
    const imagen = await payload.create({
      collection: "media",
      data: { alt: "Punto" },
      file: archivo(PNG_1x1, "image/png", "punto.png"),
      overrideAccess: true,
    });
    expect(imagen.mimeType).toBe("image/png");
    expect(imagen.filename).toMatch(/^punto(-\d+)?\.png$/);
    expect(Object.keys(imagen.sizes ?? {}).sort()).toEqual(["card", "hero", "thumbnail"]);
  });

  it("rechaza un PDF", async () => {
    const payload = await obtenerPayload();
    await expect(
      payload.create({
        collection: "media",
        data: { alt: "No es imagen" },
        file: archivo(PDF_MINIMO, "application/pdf", "documento.pdf"),
        overrideAccess: true,
      }),
    ).rejects.toMatchObject(INVALIDO);
  });

  // Auditoría S-3 corregida: `media` sólo admite mapa de bits, no SVG.
  it("rechaza SVG", async () => {
    const payload = await obtenerPayload();
    await expect(
      payload.create({
        collection: "media",
        data: { alt: "Vector" },
        file: archivo(SVG, "image/svg+xml", "vector.svg"),
        overrideAccess: true,
      }),
    ).rejects.toMatchObject(INVALIDO);
  });
});

describe("S3 · documentos (PDF)", () => {
  it("acepta un PDF", async () => {
    const payload = await obtenerPayload();
    const documento = await payload.create({
      collection: "documentos",
      data: { titulo: "Reporte" },
      file: archivo(PDF_MINIMO, "application/pdf", "reporte.pdf"),
      overrideAccess: true,
    });
    expect(documento.mimeType).toBe("application/pdf");
    expect(documento.filename).toMatch(/^reporte(-\d+)?\.pdf$/);
  });

  it("rechaza un PNG", async () => {
    const payload = await obtenerPayload();
    await expect(
      payload.create({
        collection: "documentos",
        data: { titulo: "Imagen" },
        file: archivo(PNG_1x1, "image/png", "punto.png"),
        overrideAccess: true,
      }),
    ).rejects.toMatchObject(INVALIDO);
  });
});

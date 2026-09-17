/**
 * S5 · Ayudas de lectura del CMS (src/lib/cms/util.ts): distinguen una relación
 * poblada (depth ≥ 1, objeto) de una sin poblar (sólo el id).
 */
import { describe, expect, it } from "vitest";
import type { Categoria, Documento, Media } from "@/payload-types";
import { imagen, imagenes, nombresCategorias, poblado, poblados, urlDocumento } from "@/lib/cms/util";

const categoria = (id: number, nombre: string) =>
  ({ id, nombre, slug: nombre.toLowerCase(), updatedAt: "", createdAt: "" }) as Categoria;

const documento = (url: string | null) =>
  ({ id: 7, titulo: "PDF", url, updatedAt: "", createdAt: "" }) as unknown as Documento;

const media = (id: number) => ({ id, alt: `img-${id}`, updatedAt: "", createdAt: "" }) as unknown as Media;

describe("poblado", () => {
  it("devuelve el objeto cuando la relación viene poblada", () => {
    const cat = categoria(1, "Energía");
    expect(poblado(cat)).toBe(cat);
  });

  it.each([[3], ["3"], [null], [undefined]])("devuelve null para %j (sin poblar)", (valor) => {
    expect(poblado<Categoria>(valor)).toBeNull();
  });
});

describe("poblados", () => {
  it("conserva sólo los elementos poblados, en orden", () => {
    const a = categoria(1, "A");
    const b = categoria(2, "B");
    expect(poblados<Categoria>([a, 5, b, "9"])).toEqual([a, b]);
  });

  it("devuelve [] para null o undefined", () => {
    expect(poblados(null)).toEqual([]);
    expect(poblados(undefined)).toEqual([]);
  });
});

describe("nombresCategorias", () => {
  it("lista los nombres de las categorías pobladas", () => {
    expect(nombresCategorias([categoria(1, "Energía"), categoria(2, "Agua")])).toEqual(["Energía", "Agua"]);
  });

  it("ignora ids sin poblar y listas vacías", () => {
    expect(nombresCategorias([1, categoria(2, "Agua"), 3])).toEqual(["Agua"]);
    expect(nombresCategorias(undefined)).toEqual([]);
  });
});

describe("urlDocumento", () => {
  it("devuelve la url del documento poblado", () => {
    expect(urlDocumento(documento("/documentos/reporte.pdf"))).toBe("/documentos/reporte.pdf");
  });

  it("devuelve null si sólo hay id, si no hay documento o si no tiene url", () => {
    expect(urlDocumento(4)).toBeNull();
    expect(urlDocumento(null)).toBeNull();
    expect(urlDocumento(documento(null))).toBeNull();
  });
});

describe("imagen / imagenes", () => {
  it("imagen devuelve el media poblado o null", () => {
    const m = media(1);
    expect(imagen(m)).toBe(m);
    expect(imagen(1)).toBeNull();
  });

  it("imagenes filtra los ids sin poblar", () => {
    const m = media(2);
    expect(imagenes([1, m])).toEqual([m]);
  });
});

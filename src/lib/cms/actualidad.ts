import type { Locale } from "@/i18n/routing";
import { cacheado } from "./cache";
import { obtenerPayload } from "./payload";

export const listarEntradas = cacheado(
  async (locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "entradas",
      locale,
      fallbackLocale: "es",
      sort: "-fecha",
      limit: 500,
      depth: 1,
    });
    return docs;
  },
  "entradas",
  ["entradas", "media", "categorias"],
);

export const buscarEntrada = cacheado(
  async (slug: string, locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "entradas",
      where: { slug: { equals: slug } },
      locale,
      fallbackLocale: "es",
      limit: 1,
      depth: 1,
    });
    return docs[0] ?? null;
  },
  "entrada",
  ["entradas", "media", "categorias", "documentos"],
);

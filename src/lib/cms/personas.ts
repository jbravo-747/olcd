import type { Locale } from "@/i18n/routing";
import { cacheado } from "./cache";
import { obtenerPayload } from "./payload";

export const listarPersonas = cacheado(
  async (locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "personas",
      locale,
      fallbackLocale: "es",
      sort: "orden",
      limit: 500,
      depth: 1,
    });
    return docs;
  },
  "personas",
  ["personas", "organizaciones", "media"],
);

export const buscarPersona = cacheado(
  async (slug: string, locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "personas",
      where: { slug: { equals: slug } },
      locale,
      fallbackLocale: "es",
      limit: 1,
      depth: 1,
    });
    return docs[0] ?? null;
  },
  "persona",
  ["personas", "organizaciones", "media"],
);

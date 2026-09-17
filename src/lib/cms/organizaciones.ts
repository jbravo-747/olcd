import type { Locale } from "@/i18n/routing";
import { cacheado } from "./cache";
import { obtenerPayload } from "./payload";

export const listarOrganizaciones = cacheado(
  async (locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "organizaciones",
      locale,
      fallbackLocale: "es",
      sort: "nombre",
      limit: 500,
      depth: 1,
    });
    return docs;
  },
  "organizaciones",
  ["organizaciones", "media"],
);

export const buscarOrganizacion = cacheado(
  async (slug: string, locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "organizaciones",
      where: { slug: { equals: slug } },
      locale,
      fallbackLocale: "es",
      limit: 1,
      depth: 1,
    });
    return docs[0] ?? null;
  },
  "organizacion",
  ["organizaciones", "media"],
);

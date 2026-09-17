import type { Locale } from "@/i18n/routing";
import { cacheado } from "./cache";
import { obtenerPayload } from "./payload";

export const listarPublicaciones = cacheado(
  async (locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "publicaciones",
      locale,
      fallbackLocale: "es",
      sort: "createdAt",
      limit: 500,
      depth: 1,
    });
    return docs;
  },
  "publicaciones",
  ["publicaciones", "media", "labs", "categorias"],
);

export const buscarPublicacion = cacheado(
  async (slug: string, locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "publicaciones",
      where: { slug: { equals: slug } },
      locale,
      fallbackLocale: "es",
      limit: 1,
      depth: 1,
    });
    return docs[0] ?? null;
  },
  "publicacion",
  ["publicaciones", "media", "labs", "categorias", "documentos"],
);

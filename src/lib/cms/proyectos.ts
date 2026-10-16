import type { Locale } from "@/i18n/routing";
import { cacheado } from "./cache";
import { obtenerPayload } from "./payload";

export const listarProyectosDeLab = cacheado(
  async (labSlug: string, locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "proyectos",
      where: { lab: { equals: labSlug } },
      locale,
      fallbackLocale: "es",
      sort: "createdAt",
      limit: 200,
      depth: 1,
    });
    return docs;
  },
  "proyectos-lab",
  ["proyectos", "media", "categorias"],
);

export const buscarProyecto = cacheado(
  async (labSlug: string, proyectoSlug: string, locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "proyectos",
      where: { and: [{ slug: { equals: proyectoSlug } }, { lab: { equals: labSlug } }] },
      locale,
      fallbackLocale: "es",
      limit: 1,
      depth: 2,
    });
    return docs[0] ?? null;
  },
  "proyecto",
  ["proyectos", "media", "categorias", "documentos"],
);

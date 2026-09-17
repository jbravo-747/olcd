import type { Locale } from "@/i18n/routing";
import { cacheado } from "./cache";
import { obtenerPayload } from "./payload";

export const listarLabs = cacheado(
  async (locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "labs",
      locale,
      fallbackLocale: "es",
      sort: "orden",
      limit: 50,
      depth: 1,
    });
    return docs;
  },
  "labs",
  ["labs", "media"],
);

export const buscarLab = cacheado(
  async (slug: string, locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "labs",
      where: { slug: { equals: slug } },
      locale,
      fallbackLocale: "es",
      limit: 1,
      depth: 1,
    });
    return docs[0] ?? null;
  },
  "lab",
  ["labs", "media"],
);

export const listarProyectosDeLab = cacheado(
  async (labId: number, locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "proyectos",
      where: { lab: { equals: labId } },
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
    const lab = await buscarLab(labSlug, locale);
    if (!lab) return null;
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "proyectos",
      where: { and: [{ slug: { equals: proyectoSlug } }, { lab: { equals: lab.id } }] },
      locale,
      fallbackLocale: "es",
      limit: 1,
      depth: 2,
    });
    return docs[0] ? { lab, proyecto: docs[0] } : null;
  },
  "proyecto",
  ["proyectos", "labs", "media", "categorias", "documentos"],
);

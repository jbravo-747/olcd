import type { Where } from "payload";
import type { Locale } from "@/i18n/routing";
import { cacheado } from "./cache";
import { obtenerPayload } from "./payload";

export const POR_PAGINA = 9;

export const listarCategorias = cacheado(
  async (locale: Locale) => {
    const payload = await obtenerPayload();
    const { docs } = await payload.find({
      collection: "categorias",
      locale,
      fallbackLocale: "es",
      sort: "nombre",
      limit: 200,
      depth: 0,
    });
    return docs;
  },
  "categorias",
  ["categorias"],
);

/** Búsqueda paginada en servidor; no se cachea porque depende de la consulta. */
export async function buscarNoticias({
  q,
  categoria,
  pagina,
  locale,
}: {
  q: string;
  categoria: string;
  pagina: number;
  locale: Locale;
}) {
  const payload = await obtenerPayload();
  const condiciones: Where[] = [];
  if (q) condiciones.push({ or: [{ titulo: { like: q } }, { medio: { like: q } }] });
  if (categoria) condiciones.push({ "categorias.slug": { equals: categoria } });

  return payload.find({
    collection: "noticias",
    where: condiciones.length ? { and: condiciones } : undefined,
    locale,
    fallbackLocale: "es",
    sort: "-fecha",
    limit: POR_PAGINA,
    page: pagina,
    depth: 1,
  });
}

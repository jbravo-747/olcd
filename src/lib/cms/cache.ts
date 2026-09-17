import { unstable_cache } from "next/cache";

/**
 * Envuelve una consulta al CMS en la Data Cache de Next. Los hooks de Payload
 * invalidan por etiqueta (src/cms/hooks/revalidar.ts) al guardar en el admin.
 */
export function cacheado<A extends unknown[], R>(fn: (...args: A) => Promise<R>, clave: string, tags: string[]) {
  return unstable_cache(fn, [clave], { tags });
}

import type { Categoria, Documento, Media } from "@/payload-types";

type Relacion<T> = T | number | string | null | undefined;

/** Devuelve el documento relacionado sólo si vino poblado (depth ≥ 1). */
export function poblado<T extends object>(rel: Relacion<T>): T | null {
  return rel && typeof rel === "object" ? rel : null;
}

export function poblados<T extends object>(rels: (T | number | string)[] | null | undefined): T[] {
  return (rels ?? []).filter((r): r is T => typeof r === "object");
}

export function nombresCategorias(categorias: (Categoria | number)[] | null | undefined): string[] {
  return poblados<Categoria>(categorias).map((c) => c.nombre);
}

export function urlDocumento(doc: Relacion<Documento>): string | null {
  return poblado(doc)?.url ?? null;
}

export function imagen(media: Relacion<Media>): Media | null {
  return poblado(media);
}

export function imagenes(fotos: (Media | number)[] | null | undefined): Media[] {
  return poblados<Media>(fotos);
}

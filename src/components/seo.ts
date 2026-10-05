import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

/** Ruta localizada absoluta a la raíz del sitio (localePrefix "always"). */
function rutaLocalizada(locale: Locale, path: string) {
  return `/${locale}${path === "/" ? "" : path}`;
}

/**
 * `alternates` per-ruta: canonical del idioma actual y `hreflang` es/en más
 * `x-default`. Resuelve contra `metadataBase` (Q-7 / A-6).
 */
export function alternos(locale: Locale, path: string): NonNullable<Metadata["alternates"]> {
  const ruta = path === "/" ? "" : path;
  return {
    canonical: rutaLocalizada(locale, path),
    languages: {
      es: `/es${ruta}`,
      en: `/en${ruta}`,
      "x-default": `/es${ruta}`,
    },
  };
}

/**
 * Metadata compartida por página: descripción propia, `alternates` per-ruta y
 * Open Graph básico. Las páginas la combinan con su `title`.
 */
export function metadatosPagina(locale: Locale, path: string, titulo: string, descripcion: string): Metadata {
  return {
    description: descripcion,
    alternates: alternos(locale, path),
    openGraph: {
      type: "website",
      siteName: "OLCD",
      locale: locale === "es" ? "es_ES" : "en_US",
      url: rutaLocalizada(locale, path),
      title: titulo,
      description: descripcion,
    },
  };
}

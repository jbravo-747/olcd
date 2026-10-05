import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { navegacion, enlacesLegales } from "@/lib/navegacion";

const BASE = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

/**
 * Rutas estáticas del menú y del pie (se ignoran los enlaces con ancla `#`,
 * que apuntan a secciones de una página ya incluida). Los slugs dinámicos del
 * CMS (publicaciones, actualidad, proyectos, personas, organizaciones) se
 * omiten aquí para no acoplar el sitemap a la disponibilidad de la base de
 * datos; el resto de rutas basta para el rastreo.
 */
function rutasEstaticas(): string[] {
  const rutas = new Set<string>(["/"]);
  const agregar = (href: string) => {
    if (!href.includes("#")) rutas.add(href);
  };
  for (const item of navegacion) {
    agregar(item.href);
    for (const hijo of item.hijos ?? []) agregar(hijo.href);
  }
  for (const legal of enlacesLegales) agregar(legal.href);
  return [...rutas];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  return rutasEstaticas().flatMap((ruta) => {
    const sufijo = ruta === "/" ? "" : ruta;
    return routing.locales.map((locale) => ({
      url: `${BASE}/${locale}${sufijo}`,
      lastModified: ahora,
      alternates: {
        languages: {
          es: `${BASE}/es${sufijo}`,
          en: `${BASE}/en${sufijo}`,
        },
      },
    }));
  });
}

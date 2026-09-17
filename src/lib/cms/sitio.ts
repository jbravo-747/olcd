import type { Locale } from "@/i18n/routing";
import { cacheado } from "./cache";
import { obtenerPayload } from "./payload";

export const obtenerSitio = cacheado(
  async (locale: Locale) => {
    const payload = await obtenerPayload();
    return payload.findGlobal({ slug: "sitio", locale, fallbackLocale: "es", depth: 0 });
  },
  "sitio",
  ["sitio"],
);

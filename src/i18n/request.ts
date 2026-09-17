import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const solicitado = await requestLocale;
  const locale = hasLocale(routing.locales, solicitado) ? solicitado : routing.defaultLocale;

  return {
    locale,
    // Las fechas del CMS se guardan en UTC; se formatean igual sin importar
    // la zona horaria del servidor.
    timeZone: "UTC",
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

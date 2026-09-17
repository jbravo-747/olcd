import { getLocale, getTranslations } from "next-intl/server";
import Logo from "./Logo";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { columnasFooter, enlacesLegales } from "@/lib/navegacion";
import { obtenerSitio } from "@/lib/cms/sitio";
import { IconoRed } from "./Iconos";

export default async function Footer() {
  const locale = (await getLocale()) as Locale;
  const [t, sitio] = await Promise.all([getTranslations("nav"), obtenerSitio(locale)]);
  const redes = sitio.redes?.enlaces ?? [];

  return (
    <footer className="bg-ink text-cream">
      <div className="shell grid gap-12 py-14 lg:grid-cols-[220px_1fr]">
        <Logo variante="bloque" />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {columnasFooter.map((columna) => (
            <div key={columna.titulo.href}>
              <Link href={columna.titulo.href} className="block text-[13px] font-bold hover:underline">
                {t(columna.titulo.clave)}
              </Link>
              <ul className="mt-3 space-y-2">
                {columna.enlaces.map((enlace) => (
                  <li key={enlace.href + enlace.clave}>
                    <Link href={enlace.href} className="text-[13px] text-cream/55 transition-colors hover:text-cream">
                      {t(enlace.clave)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="shell flex flex-col gap-6 border-t border-white/10 py-6 sm:flex-row sm:items-center">
        <ul className="flex items-center gap-4">
          {redes.map((red) => (
            <li key={red.id ?? red.red}>
              <a href={red.url} target="_blank" rel="noreferrer" aria-label={red.red} className="block text-cream/90 hover:text-cream">
                <IconoRed tipo={red.red} />
              </a>
            </li>
          ))}
        </ul>

        <ul className="flex flex-wrap gap-x-8 gap-y-2 sm:ml-12">
          {enlacesLegales.map((enlace) => (
            <li key={enlace.href}>
              <Link href={enlace.href} className="text-[13px] text-cream/70 hover:text-cream">
                {t(enlace.clave)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

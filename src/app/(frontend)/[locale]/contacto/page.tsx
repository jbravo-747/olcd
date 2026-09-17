import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import FormularioContacto from "@/components/FormularioContacto";
import { IconoRed } from "@/components/Iconos";
import { obtenerSitio } from "@/lib/cms/sitio";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contacto" });
  return { title: t("titulo") };
}

/** Sección 8 del árbol de navegación. */
export default async function PaginaContacto({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, sitio] = await Promise.all([getTranslations("contacto"), obtenerSitio(locale)]);
  const redes = sitio.redes?.enlaces ?? [];
  const correo = sitio.redes?.correoContacto;

  return (
    <>
      <EncabezadoPagina titulo={t("titulo")} descripcion={sitio.paginas?.contacto ?? undefined} />

      <div className="bg-cream py-16">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_320px]">
          <FormularioContacto />

          <aside className="rounded-xl bg-cream-deep p-8">
            <h2 className="display text-2xl">{t("escribenos")}</h2>
            {correo && (
              <p className="mt-4 text-sm">
                <a href={`mailto:${correo}`} className="font-semibold underline">
                  {correo}
                </a>
              </p>
            )}

            {redes.length > 0 && (
              <>
                <h3 className="mt-8 text-xs font-bold uppercase tracking-wide text-ink/60">{t("redes")}</h3>
                <ul className="mt-3 flex gap-4">
                  {redes.map((red) => (
                    <li key={red.id ?? red.red}>
                      <a href={red.url} target="_blank" rel="noreferrer" aria-label={red.red}>
                        <IconoRed tipo={red.red} />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

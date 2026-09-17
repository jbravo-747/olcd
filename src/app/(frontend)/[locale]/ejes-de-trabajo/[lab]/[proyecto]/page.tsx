import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Carrusel from "@/components/Carrusel";
import SeccionesDesplegables from "@/components/SeccionesDesplegables";
import { IconoDocumento, IconoRed } from "@/components/Iconos";
import { buscarProyecto } from "@/lib/cms/labs";
import { obtenerSitio } from "@/lib/cms/sitio";
import { imagenes, nombresCategorias, urlDocumento } from "@/lib/cms/util";

type Props = { params: Promise<{ locale: Locale; lab: string; proyecto: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, lab, proyecto } = await params;
  return { title: (await buscarProyecto(lab, proyecto, locale))?.proyecto.titulo ?? "Proyecto" };
}

/** N3 - Proyecto de lab */
export default async function PaginaProyecto({ params }: Props) {
  const { locale, lab: labSlug, proyecto: proyectoSlug } = await params;
  setRequestLocale(locale);
  const [t, sitio, resultado] = await Promise.all([
    getTranslations("proyecto"),
    obtenerSitio(locale),
    buscarProyecto(labSlug, proyectoSlug, locale),
  ]);
  if (!resultado) notFound();
  const { lab, proyecto } = resultado;

  const datos: [string, string | null | undefined][] = [
    [t("autores"), proyecto.autores],
    [t("anio"), proyecto.anio],
    [t("lugar"), proyecto.lugar],
    [t("participantes"), proyecto.participantes],
  ];
  const descargable = urlDocumento(proyecto.descargable?.archivo);
  const redes = sitio.redes?.enlaces ?? [];

  return (
    <article>
      <Carrusel fotos={imagenes(proyecto.fotos)} />

      <header className="bg-cream py-14">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_auto_240px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink/70">{lab.nombre}</p>
            <h1 className="display t-h1 mt-2">{proyecto.titulo}</h1>

            <dl className="mt-10 max-w-md">
              {datos
                .filter(([, valor]) => valor)
                .map(([clave, valor]) => (
                  <div key={clave} className="flex justify-between gap-6 border-b border-line py-3">
                    <dt className="text-[13px] font-bold">{clave}</dt>
                    <dd className="text-[13px] text-ink/75">{valor}</dd>
                  </div>
                ))}
            </dl>
          </div>

          <div className="flex items-center">
            {descargable ? (
              <a href={descargable} className="pill pill-dark gap-2 px-5 py-3" target="_blank" rel="noreferrer">
                <IconoDocumento className="h-5 w-5" />
                {proyecto.descargable?.etiqueta ?? "PDF"}
              </a>
            ) : (
              <span className="text-ink/60" aria-hidden>
                <IconoDocumento className="h-8 w-8" />
              </span>
            )}
          </div>

          <div className="flex flex-col items-start gap-6 lg:items-end">
            <ul className="flex flex-wrap gap-2 lg:justify-end">
              {nombresCategorias(proyecto.categorias).map((c) => (
                <li key={c}>
                  <span className="tag">{c}</span>
                </li>
              ))}
            </ul>
            <ul className="flex gap-4">
              {redes.map((red) => (
                <li key={red.id ?? red.red}>
                  <a href={red.url} target="_blank" rel="noreferrer" aria-label={t("compartir", { red: red.red })}>
                    <IconoRed tipo={red.red} className="h-6 w-6" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <SeccionesDesplegables secciones={proyecto.secciones ?? []} />
    </article>
  );
}

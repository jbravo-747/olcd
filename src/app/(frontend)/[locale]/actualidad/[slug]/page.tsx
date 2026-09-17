import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Carrusel from "@/components/Carrusel";
import TextoEnriquecido from "@/components/TextoEnriquecido";
import { IconoDocumento } from "@/components/Iconos";
import { buscarEntrada } from "@/lib/cms/actualidad";
import { imagenes, nombresCategorias, urlDocumento } from "@/lib/cms/util";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return { title: (await buscarEntrada(slug, locale))?.titulo ?? "Actualidad" };
}

/** N2 - Página interna de Actualidad (blog, comunicado, prensa o noticia). */
export default async function PaginaEntrada({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, tComun, formato, entrada] = await Promise.all([
    getTranslations("actualidad"),
    getTranslations("comun"),
    getFormatter(),
    buscarEntrada(slug, locale),
  ]);
  if (!entrada) notFound();

  const pdf = urlDocumento(entrada.pdf);
  const datos: [string, string | null | undefined][] = [
    [t("medio"), entrada.fuente],
    [t("creditos"), entrada.creditos],
    [t("participantes"), entrada.participantes],
  ];

  return (
    <article>
      <Carrusel fotos={imagenes(entrada.fotos)} />

      <div className="bg-cream py-14">
        <div className="shell max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/55">{t(`tipos.${entrada.tipo}`)}</p>
          <h1 className="display t-h1 mt-2">{entrada.titulo}</h1>
          <p className="mt-4 text-sm text-ink/70">
            <time dateTime={entrada.fecha}>{formato.dateTime(new Date(entrada.fecha), { dateStyle: "full" })}</time>
          </p>

          <p className="mt-8 text-[15px] leading-relaxed text-ink/85">{entrada.descripcion}</p>

          <dl className="mt-10 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {datos
              .filter(([, valor]) => valor)
              .map(([clave, valor]) => (
                <div key={clave} className="border-b border-line py-2">
                  <dt className="text-xs uppercase tracking-wide text-ink/55">{clave}</dt>
                  <dd className="mt-1 text-[15px] font-semibold">{valor}</dd>
                </div>
              ))}
          </dl>

          <ul className="mt-6 flex flex-wrap gap-2">
            {nombresCategorias(entrada.categorias).map((c) => (
              <li key={c}>
                <span className="tag">{c}</span>
              </li>
            ))}
          </ul>

          {pdf && (
            <a href={pdf} className="pill pill-dark mt-8 gap-2 px-6 py-3" target="_blank" rel="noreferrer">
              <IconoDocumento className="h-5 w-5" />
              {tComun("descargarPdf")}
            </a>
          )}

          <TextoEnriquecido datos={entrada.contenido} className="mt-12" />
        </div>
      </div>
    </article>
  );
}

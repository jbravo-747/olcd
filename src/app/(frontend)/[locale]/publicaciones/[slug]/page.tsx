import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import Imagen from "@/components/Imagen";
import TextoEnriquecido from "@/components/TextoEnriquecido";
import { IconoDocumento } from "@/components/Iconos";
import { buscarPublicacion } from "@/lib/cms/publicaciones";
import { imagen, nombresCategorias, poblado, urlDocumento } from "@/lib/cms/util";
import type { Lab } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  return { title: (await buscarPublicacion(slug, locale))?.titulo ?? "Publicación" };
}

/** N2 - Recurso */
export default async function PaginaRecurso({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, tComun, recurso] = await Promise.all([
    getTranslations("publicaciones"),
    getTranslations("comun"),
    buscarPublicacion(slug, locale),
  ]);
  if (!recurso) notFound();

  const datos: [string, string | null | undefined][] = [
    [t("lab"), poblado<Lab>(recurso.lab)?.nombre],
    [t("autores"), recurso.autores],
    [t("anio"), recurso.anio],
    [t("paginas"), recurso.paginas],
  ];
  const pdf = urlDocumento(recurso.pdf);

  return (
    <article className="bg-cream pb-20">
      <div className="shell pt-12">
        <h1 className="display t-h1 max-w-[18ch]">{recurso.titulo}</h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Imagen
            media={imagen(recurso.portada)}
            className="aspect-[4/3] w-full rounded-xl"
            sizes="(min-width: 1024px) 600px, 100vw"
            priority
          />

          <div className="self-center">
            <dl>
              {datos
                .filter(([, valor]) => valor)
                .map(([clave, valor]) => (
                  <div key={clave} className="border-b border-line py-3">
                    <dt className="text-xs uppercase tracking-wide text-ink/70">{clave}</dt>
                    <dd className="mt-1 text-[15px] font-semibold">{valor}</dd>
                  </div>
                ))}
            </dl>

            <ul className="mt-6 flex flex-wrap gap-2">
              {nombresCategorias(recurso.categorias).map((c) => (
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
          </div>
        </div>

        <TextoEnriquecido datos={recurso.contenido} className="mt-14 max-w-4xl" />
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import Imagen from "@/components/Imagen";
import { metadatosPagina } from "@/components/seo";
import { listarLabs } from "@/lib/cms/labs";
import { obtenerSitio } from "@/lib/cms/sitio";
import { imagen } from "@/lib/cms/util";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, tSeo, sitio] = await Promise.all([
    getTranslations({ locale, namespace: "ejes" }),
    getTranslations({ locale, namespace: "seo" }),
    obtenerSitio(locale),
  ]);
  return {
    title: t("titulo"),
    ...metadatosPagina(locale, "/ejes-de-trabajo", t("titulo"), sitio.paginas?.ejesDeTrabajo || tSeo("ejesDeTrabajo")),
  };
}

/** N1 - Ejes de trabajo */
export default async function EjesDeTrabajo({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tComun, sitio, labs] = await Promise.all([
    getTranslations("ejes"),
    getTranslations("comun"),
    obtenerSitio(locale),
    listarLabs(locale),
  ]);

  return (
    <>
      <EncabezadoPagina titulo={t("titulo")} descripcion={sitio.paginas?.ejesDeTrabajo ?? undefined} alto="alto" />

      <div className="bg-cream py-16">
        <div className="shell space-y-6">
          {labs.map((lab, i) => (
            <article
              key={lab.slug}
              className={`grid items-center gap-8 overflow-hidden rounded-xl bg-cream-deep lg:grid-cols-2 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <Imagen
                media={imagen(lab.imagen)}
                className="h-full min-h-[280px] w-full"
                sizes="(min-width: 1024px) 600px, 100vw"
              />
              <div className="p-8 lg:p-12">
                <h2 className="display text-3xl">{lab.nombre}</h2>
                <p className="mt-5 text-[15px] leading-relaxed text-ink/80">{lab.descripcion}</p>
                <Link href={`/ejes-de-trabajo/${lab.slug}`} className="pill pill-dark mt-7">
                  {tComun("leerMas")}
                  <span className="sr-only"> {tComun("sobre", { titulo: lab.nombre })}</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

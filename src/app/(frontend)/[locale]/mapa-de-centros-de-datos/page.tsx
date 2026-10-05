import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import MapaCentros from "@/components/MapaCentros";
import { metadatosPagina } from "@/components/seo";
import { listarCentros } from "@/lib/cms/centros";
import { obtenerSitio } from "@/lib/cms/sitio";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, tSeo, sitio] = await Promise.all([
    getTranslations({ locale, namespace: "mapa" }),
    getTranslations({ locale, namespace: "seo" }),
    obtenerSitio(locale),
  ]);
  const descripcion = sitio.paginas?.mapa || sitio.paginas?.mapaResumen || tSeo("mapa");
  return {
    title: t("titulo"),
    ...metadatosPagina(locale, "/mapa-de-centros-de-datos", t("titulo"), descripcion),
  };
}

/** Sección 4 del árbol de navegación: mapa interactivo. */
export default async function PaginaMapa({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, sitio, centros] = await Promise.all([getTranslations("mapa"), obtenerSitio(locale), listarCentros()]);

  return (
    <>
      <EncabezadoPagina titulo={t("titulo")} descripcion={sitio.paginas?.mapa ?? undefined} />
      <div className="bg-cream">
        <MapaCentros centros={centros} />
      </div>
    </>
  );
}

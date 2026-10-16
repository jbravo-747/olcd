import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import MapaCentrosInteractivo from "@/components/mapa/MapaCentrosInteractivo";
import { metadatosPagina } from "@/components/seo";
import datosPrensa from "@/datos/datacenters-prensa.json";
import type { DatosPrensa } from "@/datos/tipos";
import { textosDelSitio } from "@/contenido/textos";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mapa" });
  const descripcion = textosDelSitio(locale).paginas.mapa;
  return {
    title: t("titulo"),
    ...metadatosPagina(locale, "/mapa-de-centros-de-datos", t("titulo"), descripcion),
  };
}

/** Sección 4 del árbol de navegación: mapa interactivo. */
export default async function PaginaMapa({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mapa");

  return (
    <>
      <EncabezadoPagina titulo={t("titulo")} descripcion={textosDelSitio(locale).paginas.mapa} />
      <div className="bg-cream">
        <MapaCentrosInteractivo datos={datosPrensa as DatosPrensa} />
      </div>
    </>
  );
}

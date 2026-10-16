import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import ExploradorPublicaciones from "@/components/ExploradorPublicaciones";
import { metadatosPagina } from "@/components/seo";
import { listarEntradas } from "@/lib/cms/actualidad";
import { textosDelSitio } from "@/contenido/textos";
import { imagenes } from "@/lib/cms/util";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, tSeo] = await Promise.all([
    getTranslations({ locale, namespace: "actualidad" }),
    getTranslations({ locale, namespace: "seo" }),
  ]);
  return {
    title: t("titulo"),
    ...metadatosPagina(locale, "/actualidad", t("titulo"), tSeo("actualidad")),
  };
}

/** N1 - Actualidad (Blog · Comunicados · Cobertura de prensa · Noticias) */
export default async function PaginaActualidad({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tComun, entradas] = await Promise.all([
    getTranslations("actualidad"),
    getTranslations("comun"),
    listarEntradas(locale),
  ]);
  const textos = textosDelSitio(locale).actualidad;

  const categorias = [
    { slug: "blog", nombre: t("tipos.blog"), descripcion: textos.blog },
    { slug: "comunicados", nombre: t("tipos.comunicados"), descripcion: textos.comunicados },
    {
      slug: "cobertura-de-prensa",
      nombre: t("tipos.cobertura-de-prensa"),
      descripcion: textos.coberturaPrensa,
    },
    {
      slug: "noticias-del-observatorio",
      nombre: t("tipos.noticias-del-observatorio"),
      descripcion: textos.noticiasObservatorio,
    },
  ];

  const items = entradas.map((e) => ({
    slug: e.slug,
    tipo: e.tipo,
    titulo: e.titulo,
    descripcion: e.descripcion,
    etiqueta: t(`tipos.${e.tipo}`),
    href: `/actualidad/${e.slug}`,
    imagen: imagenes(e.fotos)[0] ?? null,
  }));

  return (
    <ExploradorPublicaciones
      titulo={t("titulo")}
      etiquetaTipo={tComun("seccion")}
      categorias={categorias}
      items={items}
    />
  );
}

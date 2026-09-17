import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import ExploradorPublicaciones from "@/components/ExploradorPublicaciones";
import { listarPublicaciones } from "@/lib/cms/publicaciones";
import { obtenerSitio } from "@/lib/cms/sitio";
import { imagen } from "@/lib/cms/util";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "publicaciones" });
  return { title: t("titulo") };
}

/** N1 - Publicaciones */
export default async function PaginaPublicaciones({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tComun, sitio, publicaciones] = await Promise.all([
    getTranslations("publicaciones"),
    getTranslations("comun"),
    obtenerSitio(locale),
    listarPublicaciones(locale),
  ]);

  const categorias = [
    { slug: "reportes", nombre: t("tipos.reportes"), descripcion: sitio.publicaciones?.reportes ?? "" },
    { slug: "articulos-y-libros", nombre: t("tipos.articulos-y-libros"), descripcion: sitio.publicaciones?.articulosLibros ?? "" },
    { slug: "recursos-educativos", nombre: t("tipos.recursos-educativos"), descripcion: sitio.publicaciones?.recursosEducativos ?? "" },
  ];

  const items = publicaciones.map((p) => ({
    slug: p.slug,
    tipo: p.tipo,
    titulo: p.titulo,
    descripcion: p.descripcion,
    etiqueta: t(`tipos.${p.tipo}`),
    href: `/publicaciones/${p.slug}`,
    imagen: imagen(p.portada),
  }));

  return (
    <ExploradorPublicaciones
      titulo={t("titulo")}
      etiquetaTipo={tComun("tipo")}
      categorias={categorias}
      items={items}
    />
  );
}

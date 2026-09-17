import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import GridRecursos, { type Recurso } from "@/components/GridRecursos";
import MapaCentros from "@/components/MapaCentros";
import { metadatosPagina } from "@/components/seo";
import { listarPublicaciones } from "@/lib/cms/publicaciones";
import { listarEntradas } from "@/lib/cms/actualidad";
import { listarCentros } from "@/lib/cms/centros";
import { obtenerSitio } from "@/lib/cms/sitio";
import { imagen, imagenes } from "@/lib/cms/util";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const [t, tSeo, sitio] = await Promise.all([
    getTranslations({ locale, namespace: "inicio" }),
    getTranslations({ locale, namespace: "seo" }),
    obtenerSitio(locale),
  ]);
  return metadatosPagina(locale, "/", t("titulo"), sitio.inicio?.texto || tSeo("inicio"));
}

/** N1 - Inicio */
export default async function Inicio({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tPub, tAct, tComun, sitio, publicaciones, entradas, centros] = await Promise.all([
    getTranslations("inicio"),
    getTranslations("publicaciones.tipos"),
    getTranslations("actualidad.tipos"),
    getTranslations("comun"),
    obtenerSitio(locale),
    listarPublicaciones(locale),
    listarEntradas(locale),
    listarCentros(),
  ]);

  // "Lo más reciente": mezcla de reportes, blog y artículos, como en el wireframe.
  const reportes: Recurso[] = publicaciones
    .filter((p) => p.tipo === "reportes")
    .slice(0, 4)
    .map((p) => ({
      slug: p.slug,
      titulo: p.titulo,
      descripcion: p.descripcion,
      etiqueta: tPub("reportes"),
      href: `/publicaciones/${p.slug}`,
      imagen: imagen(p.portada),
    }));

  const blog: Recurso[] = entradas
    .filter((e) => e.tipo === "blog")
    .slice(0, 4)
    .map((e) => ({
      slug: e.slug,
      titulo: e.titulo,
      descripcion: e.descripcion,
      etiqueta: tAct("blog"),
      href: `/actualidad/${e.slug}`,
      imagen: imagenes(e.fotos)[0] ?? null,
    }));

  const articulos: Recurso[] = publicaciones
    .filter((p) => p.tipo === "articulos-y-libros")
    .slice(0, 4)
    .map((p) => ({
      slug: p.slug,
      titulo: p.titulo,
      descripcion: p.descripcion,
      etiqueta: tPub("articulos-y-libros"),
      href: `/publicaciones/${p.slug}`,
      imagen: imagen(p.portada),
    }));

  // Se intercalan los tres tipos para que cada fila muestre uno de cada uno.
  // Se recorre hasta el más largo, no sólo los reportes: si un tipo está vacío
  // los otros dos siguen apareciendo (auditoría Q-3).
  const filas = Math.max(reportes.length, blog.length, articulos.length);
  const recientes = Array.from({ length: filas }, (_, i) => [reportes[i], blog[i], articulos[i]])
    .flat()
    .filter((r): r is Recurso => Boolean(r));

  return (
    <>
      <section className="relative overflow-hidden bg-cream py-24 sm:py-32">
        <div className="hero-pattern" aria-hidden />

        <div className="shell relative text-center">
          <h1 className="display t-h1 mx-auto max-w-[20ch]">{t("titulo")}</h1>
          {sitio.inicio?.texto && <p className="t-lead mx-auto mt-6 max-w-[var(--lead-max)]">{sitio.inicio.texto}</p>}
          <Link href="/quienes-somos" className="pill pill-dark mt-12">
            {(await getTranslations("quienesSomos"))("titulo")}
          </Link>
        </div>
      </section>

      <section aria-labelledby="titulo-mapa">
        <h2 id="titulo-mapa" className="sr-only">
          {t("mapaTitulo")}
        </h2>
        <MapaCentros resumido centros={centros} descripcion={sitio.paginas?.mapaResumen} />
        <div className="bg-slate pb-12 text-center">
          <Link href="/mapa-de-centros-de-datos" className="pill pill-dark">
            {t("verMapa")}
          </Link>
        </div>
      </section>

      <section className="bg-slate py-16" aria-labelledby="titulo-reciente">
        <div className="shell">
          <h2 id="titulo-reciente" className="display t-section text-cream">
            {t("reciente")}
          </h2>
          <div className="mt-10">
            {recientes.length === 0 ? (
              <p className="text-[15px] text-cream/90">{tComun("sinContenido")}</p>
            ) : (
              <GridRecursos
                recursos={recientes}
                porPagina={3}
                tema="oscuro"
                etiquetaPaginacion={t("paginacionReciente")}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

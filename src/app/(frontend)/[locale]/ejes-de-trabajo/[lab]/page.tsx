import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import EncabezadoPagina, { TituloSeccion } from "@/components/EncabezadoPagina";
import GridRecursos from "@/components/GridRecursos";
import TextoEnriquecido from "@/components/TextoEnriquecido";
import { buscarLab, listarProyectosDeLab } from "@/lib/cms/labs";
import { imagenes } from "@/lib/cms/util";

type Props = { params: Promise<{ locale: Locale; lab: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, lab } = await params;
  return { title: (await buscarLab(lab, locale))?.nombre ?? "Lab" };
}

/** N2 - Página interna de lab */
export default async function PaginaLab({ params }: Props) {
  const { locale, lab: slug } = await params;
  setRequestLocale(locale);
  const [t, tComun, lab] = await Promise.all([
    getTranslations("ejes"),
    getTranslations("comun"),
    buscarLab(slug, locale),
  ]);
  if (!lab) notFound();

  const proyectos = await listarProyectosDeLab(lab.id, locale);
  const recursos = proyectos.map((p) => ({
    slug: p.slug,
    titulo: p.titulo,
    descripcion: p.descripcion,
    href: `/ejes-de-trabajo/${lab.slug}/${p.slug}`,
    imagen: imagenes(p.fotos)[0] ?? null,
  }));

  return (
    <>
      <EncabezadoPagina titulo={lab.nombre} alto="alto" />

      <section className="bg-cream py-16">
        <div className="shell max-w-4xl">
          <TextoEnriquecido datos={lab.introduccion} className="text-center" />
        </div>
      </section>

      <section className="bg-cream-deep py-16">
        <div className="shell">
          <TituloSeccion>{t("proyectos")}</TituloSeccion>
          <div className="mt-10">
            {recursos.length === 0 ? (
              <p className="text-[15px] text-ink/70">{tComun("sinContenido")}</p>
            ) : (
              <GridRecursos
                recursos={recursos}
                porPagina={9}
                etiquetaPaginacion={t("paginacionProyectos", { lab: lab.nombre })}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}

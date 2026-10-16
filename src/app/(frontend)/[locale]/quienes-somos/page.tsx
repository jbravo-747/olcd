import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import GridPersonas, { type FichaPersona } from "@/components/GridPersonas";
import GridOrganizaciones from "@/components/GridOrganizaciones";
import Parrafos from "@/components/Parrafos";
import { TituloSeccion } from "@/components/EncabezadoPagina";
import { metadatosPagina } from "@/components/seo";
import { equipo as miembrosEquipo } from "@/contenido/equipo";
import { organizaciones } from "@/contenido/organizaciones";
import { textosDelSitio } from "@/contenido/textos";
import { listarPersonas } from "@/lib/cms/personas";
import { imagen } from "@/lib/cms/util";
import type { Persona } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const [t, tSeo] = await Promise.all([
    getTranslations({ locale, namespace: "quienesSomos" }),
    getTranslations({ locale, namespace: "seo" }),
  ]);
  return {
    title: t("titulo"),
    ...metadatosPagina(locale, "/quienes-somos", t("titulo"), tSeo("quienesSomos")),
  };
}

const grupos: Persona["grupo"][] = ["investigacion", "comunidad", "aliados"];

function ficha(p: Persona): FichaPersona {
  return {
    slug: p.slug,
    nombre: p.nombre,
    titulo: p.titulo ?? "",
    organizacion: p.organizacion ?? "",
    foto: imagen(p.foto),
  };
}

/** N1 - Quiénes somos (Propósito · Equipo · Directorios) */
export default async function QuienesSomos({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tComun, personas] = await Promise.all([
    getTranslations("quienesSomos"),
    getTranslations("comun"),
    listarPersonas(locale),
  ]);
  const textos = textosDelSitio(locale).quienesSomos;
  const equipo = miembrosEquipo.map((p) => ({
    slug: p.slug,
    nombre: p.nombre,
    titulo: p.titulo,
    organizacion: "",
    foto: p.foto,
  }));
  const hayDirectorioPersonas = personas.length > 0;

  return (
    <>
      <section id="proposito" className="bg-cream py-16 scroll-mt-20">
        <div className="shell">
          <h1 className="display t-section max-w-5xl">{textos.titulo}</h1>
          <Parrafos parrafos={textos.proposito} className="mt-10 max-w-4xl" />
        </div>
      </section>

      <section id="equipo" className="bg-cream-deep py-16 scroll-mt-20">
        <div className="shell">
          <TituloSeccion>{t("equipo")}</TituloSeccion>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/80">{textos.equipoTexto}</p>
          <div className="mt-12">
            {equipo.length === 0 ? (
              <p className="text-[15px] text-ink/70">{tComun("sinContenido")}</p>
            ) : (
              <GridPersonas personas={equipo} porPagina={8} etiquetaPaginacion={t("paginacionEquipo")} />
            )}
          </div>
        </div>
      </section>

      <section id="organizaciones" className="bg-cream py-16 scroll-mt-20">
        <div className="shell">
          <TituloSeccion>{t("directorioOrganizaciones")}</TituloSeccion>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/80">{textos.organizacionesTexto}</p>
          <div className="mt-12">
            {organizaciones.length === 0 ? (
              <p className="text-[15px] text-ink/70">{tComun("sinContenido")}</p>
            ) : (
              <GridOrganizaciones
                organizaciones={organizaciones.map((o) => ({ slug: o.slug, nombre: o.nombre, logo: o.logo }))}
                porPagina={8}
              />
            )}
          </div>
        </div>
      </section>

      <section id="personas" className="bg-cream-deep py-16 scroll-mt-20">
        <div className="shell">
          <TituloSeccion>{t("directorioPersonas")}</TituloSeccion>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/80">{textos.personasTexto}</p>

          {grupos.map((grupo) => {
            const miembros = personas.filter((p) => p.grupo === grupo).map(ficha);
            if (miembros.length === 0) return null;
            const nombreGrupo = t(`grupos.${grupo}`);
            return (
              <div key={grupo} className="mt-14">
                <h3 className="text-lg font-bold">{nombreGrupo}</h3>
                <div className="mt-8">
                  <GridPersonas
                    personas={miembros}
                    porPagina={4}
                    etiquetaPaginacion={t("paginacionGrupo", { grupo: nombreGrupo })}
                  />
                </div>
              </div>
            );
          })}

          {!hayDirectorioPersonas && <p className="mt-8 text-[15px] text-ink/70">{tComun("sinContenido")}</p>}
        </div>
      </section>
    </>
  );
}

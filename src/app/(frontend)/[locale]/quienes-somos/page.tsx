import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import GridPersonas, { type FichaPersona } from "@/components/GridPersonas";
import GridOrganizaciones from "@/components/GridOrganizaciones";
import TextoEnriquecido from "@/components/TextoEnriquecido";
import { TituloSeccion } from "@/components/EncabezadoPagina";
import { listarPersonas } from "@/lib/cms/personas";
import { listarOrganizaciones } from "@/lib/cms/organizaciones";
import { obtenerSitio } from "@/lib/cms/sitio";
import { imagen, poblado } from "@/lib/cms/util";
import type { Organizacion, Persona } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "quienesSomos" });
  return { title: t("titulo") };
}

const grupos: Persona["grupo"][] = ["investigacion", "comunidad", "aliados"];

function ficha(p: Persona): FichaPersona {
  return {
    slug: p.slug,
    nombre: p.nombre,
    titulo: p.titulo ?? "",
    organizacion: poblado<Organizacion>(p.organizacion)?.nombre ?? "",
    foto: imagen(p.foto),
  };
}

/** N1 - Quiénes somos (Propósito · Equipo · Directorios) */
export default async function QuienesSomos({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, sitio, personas, organizaciones] = await Promise.all([
    getTranslations("quienesSomos"),
    obtenerSitio(locale),
    listarPersonas(locale),
    listarOrganizaciones(locale),
  ]);
  const textos = sitio.quienesSomos;
  const equipo = personas.filter((p) => p.equipo).map(ficha);

  return (
    <>
      <section id="proposito" className="bg-cream py-16 scroll-mt-20">
        <div className="shell grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-20">
          <h1 className="display t-section">{textos?.titulo ?? t("titulo")}</h1>
          <TextoEnriquecido datos={textos?.proposito} className="max-w-3xl" />
        </div>
      </section>

      <section id="equipo" className="bg-cream-deep py-16 scroll-mt-20">
        <div className="shell">
          <TituloSeccion>{t("equipo")}</TituloSeccion>
          {textos?.equipoTexto && (
            <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/80">{textos.equipoTexto}</p>
          )}
          <div className="mt-12">
            <GridPersonas personas={equipo} porPagina={8} etiquetaPaginacion={t("paginacionEquipo")} />
          </div>
        </div>
      </section>

      <section id="organizaciones" className="bg-cream py-16 scroll-mt-20">
        <div className="shell">
          <TituloSeccion>{t("directorioOrganizaciones")}</TituloSeccion>
          {textos?.organizacionesTexto && (
            <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/80">{textos.organizacionesTexto}</p>
          )}
          <div className="mt-12">
            <GridOrganizaciones
              organizaciones={organizaciones.map((o) => ({ slug: o.slug, nombre: o.nombre, logo: imagen(o.logo) }))}
              porPagina={8}
            />
          </div>
        </div>
      </section>

      <section id="personas" className="bg-cream-deep py-16 scroll-mt-20">
        <div className="shell">
          <TituloSeccion>{t("directorioPersonas")}</TituloSeccion>
          {textos?.personasTexto && (
            <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/80">{textos.personasTexto}</p>
          )}

          {grupos.map((grupo) => {
            const miembros = personas.filter((p) => !p.equipo && p.grupo === grupo).map(ficha);
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
        </div>
      </section>
    </>
  );
}

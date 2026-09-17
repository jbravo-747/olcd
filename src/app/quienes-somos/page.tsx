import type { Metadata } from "next";
import GridPersonas from "@/components/GridPersonas";
import GridOrganizaciones from "@/components/GridOrganizaciones";
import { TituloSeccion } from "@/components/EncabezadoPagina";
import { equipo, personasPorGrupo } from "@/data/personas";
import { organizaciones } from "@/data/organizaciones";
import { descripcionCortaLarga, descripcionLarga } from "@/data/lorem";

export const metadata: Metadata = { title: "Quiénes somos" };

/** N1 - Quiénes somos (Propósito · Equipo · Directorios) */
export default function QuienesSomos() {
  return (
    <>
      {/* Propósito */}
      <section id="proposito" className="bg-cream py-16 scroll-mt-20">
        <div className="shell grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-20">
          <h1 className="display t-section">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sodales orci in neque euismod rhoncus.
          </h1>
          <div className="max-w-3xl">
            {descripcionLarga.map((p, i) => (
              <p key={i} className="mb-6 text-[15px] leading-[1.75] text-ink/85">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section id="equipo" className="bg-cream-deep py-16 scroll-mt-20">
        <div className="shell">
          <TituloSeccion>Equipo</TituloSeccion>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/80">{descripcionCortaLarga}</p>
          <div className="mt-12">
            <GridPersonas personas={equipo} porPagina={8} etiquetaPaginacion="Paginación del equipo" />
          </div>
        </div>
      </section>

      {/* Directorio de organizaciones */}
      <section id="organizaciones" className="bg-cream py-16 scroll-mt-20">
        <div className="shell">
          <TituloSeccion>Directorio de organizaciones</TituloSeccion>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/80">{descripcionCortaLarga}</p>
          <div className="mt-12">
            <GridOrganizaciones organizaciones={organizaciones} porPagina={8} />
          </div>
        </div>
      </section>

      {/* Directorio de personas, agrupado por subtítulos */}
      <section id="personas" className="bg-cream-deep py-16 scroll-mt-20">
        <div className="shell">
          <TituloSeccion>Directorio de personas</TituloSeccion>
          <p className="mt-6 max-w-3xl text-[15px] leading-relaxed text-ink/80">{descripcionCortaLarga}</p>

          {personasPorGrupo.map((grupo) => (
            <div key={grupo.grupo} className="mt-14">
              <h3 className="text-lg font-bold">{grupo.grupo}</h3>
              <div className="mt-8">
                <GridPersonas
                  personas={grupo.personas}
                  porPagina={4}
                  etiquetaPaginacion={`Paginación de ${grupo.grupo}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

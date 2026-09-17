import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EncabezadoPagina, { TituloSeccion } from "@/components/EncabezadoPagina";
import GridRecursos from "@/components/GridRecursos";
import { buscarLab, labs } from "@/data/labs";

export function generateStaticParams() {
  return labs.map((l) => ({ lab: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lab: string }> }): Promise<Metadata> {
  const { lab } = await params;
  return { title: buscarLab(lab)?.nombre ?? "Eje de trabajo" };
}

/** N2 - Página interna de lab */
export default async function PaginaLab({ params }: { params: Promise<{ lab: string }> }) {
  const { lab: slug } = await params;
  const lab = buscarLab(slug);
  if (!lab) notFound();

  const recursos = lab.proyectos.map((p) => ({
    slug: p.slug,
    titulo: p.titulo,
    descripcion: p.descripcion,
    href: `/ejes-de-trabajo/${lab.slug}/${p.slug}`,
  }));

  return (
    <>
      <EncabezadoPagina titulo={lab.nombre} alto="alto" />

      <section className="bg-cream py-16">
        <div className="shell max-w-4xl">
          {lab.introduccion.map((p, i) => (
            <p key={i} className="mb-6 text-center text-[15px] leading-[1.75] text-ink/85">
              {p}
            </p>
          ))}
        </div>
      </section>

      <section className="bg-cream-deep py-16">
        <div className="shell">
          <TituloSeccion>Proyectos</TituloSeccion>
          <div className="mt-10">
            <GridRecursos recursos={recursos} porPagina={9} etiquetaPaginacion={`Paginación de proyectos de ${lab.nombre}`} />
          </div>
        </div>
      </section>
    </>
  );
}

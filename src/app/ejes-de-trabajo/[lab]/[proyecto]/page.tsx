import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Carrusel from "@/components/Carrusel";
import SeccionesDesplegables from "@/components/SeccionesDesplegables";
import { IconoDocumento, IconoRed } from "@/components/Iconos";
import { buscarProyecto, labs } from "@/data/labs";
import { redes } from "@/data/navegacion";

export function generateStaticParams() {
  return labs.flatMap((l) => l.proyectos.map((p) => ({ lab: l.slug, proyecto: p.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lab: string; proyecto: string }>;
}): Promise<Metadata> {
  const { lab, proyecto } = await params;
  return { title: buscarProyecto(lab, proyecto)?.proyecto.titulo ?? "Proyecto" };
}

/** N3 - Proyecto de lab */
export default async function PaginaProyecto({
  params,
}: {
  params: Promise<{ lab: string; proyecto: string }>;
}) {
  const { lab: labSlug, proyecto: proyectoSlug } = await params;
  const resultado = buscarProyecto(labSlug, proyectoSlug);
  if (!resultado) notFound();
  const { lab, proyecto } = resultado;

  const datos: [string, string][] = [
    ["Autores", proyecto.autores],
    ["Año", proyecto.anio],
    ["Lugar", proyecto.lugar],
    ["Participantes", proyecto.participantes],
  ];

  return (
    <article>
      <Carrusel fotos={proyecto.fotos} />

      <header className="bg-cream py-14">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_auto_240px]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink/55">{lab.nombre}</p>
            <h1 className="display t-h1 mt-2">{proyecto.titulo}</h1>

            <dl className="mt-10 max-w-md">
              {datos.map(([clave, valor]) => (
                <div key={clave} className="flex justify-between gap-6 border-b border-line py-3">
                  <dt className="text-[13px] font-bold">{clave}</dt>
                  <dd className="text-[13px] text-ink/75">{valor}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex items-center">
            {proyecto.descargable ? (
              <a href={proyecto.descargable.archivo} className="pill pill-dark gap-2 px-5 py-3">
                <IconoDocumento className="h-5 w-5" />
                {proyecto.descargable.etiqueta}
              </a>
            ) : (
              <span className="text-ink/60" aria-hidden>
                <IconoDocumento className="h-8 w-8" />
              </span>
            )}
          </div>

          <div className="flex flex-col items-start gap-6 lg:items-end">
            <ul className="flex flex-wrap gap-2 lg:justify-end">
              {proyecto.categorias.map((c) => (
                <li key={c}>
                  <span className="tag">{c}</span>
                </li>
              ))}
            </ul>
            <ul className="flex gap-4">
              {redes.map((red) => (
                <li key={red.label}>
                  <a href={red.href} target="_blank" rel="noreferrer" aria-label={`Compartir en ${red.label}`}>
                    <IconoRed tipo={red.icono} className="h-6 w-6" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <SeccionesDesplegables secciones={proyecto.secciones} />
    </article>
  );
}

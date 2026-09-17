import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Carrusel from "@/components/Carrusel";
import { IconoDocumento } from "@/components/Iconos";
import { buscarEntrada, entradas, tiposActualidad } from "@/data/actualidad";

export function generateStaticParams() {
  return entradas.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: buscarEntrada(slug)?.titulo ?? "Actualidad" };
}

/** N2 - Página interna de Actualidad (blog, comunicado, prensa o noticia). */
export default async function PaginaEntrada({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entrada = buscarEntrada(slug);
  if (!entrada) notFound();

  const seccion = tiposActualidad.find((t) => t.slug === entrada.tipo)?.nombre ?? "Actualidad";

  return (
    <article>
      <Carrusel fotos={entrada.fotos} etiqueta="[Galería de imágenes]" />

      <div className="bg-cream py-14">
        <div className="shell max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-wide text-ink/55">{seccion}</p>
          <h1 className="display t-h1 mt-2">{entrada.titulo}</h1>
          <p className="mt-4 text-sm text-ink/70">{entrada.fecha}</p>

          <p className="mt-8 text-[15px] leading-relaxed text-ink/85">{entrada.descripcion}</p>

          <dl className="mt-10 grid gap-x-10 gap-y-3 sm:grid-cols-2">
            {entrada.fuente && (
              <div className="border-b border-line py-2">
                <dt className="text-xs uppercase tracking-wide text-ink/55">Medio</dt>
                <dd className="mt-1 text-[15px] font-semibold">{entrada.fuente}</dd>
              </div>
            )}
            <div className="border-b border-line py-2">
              <dt className="text-xs uppercase tracking-wide text-ink/55">Créditos</dt>
              <dd className="mt-1 text-[15px] font-semibold">{entrada.creditos}</dd>
            </div>
            <div className="border-b border-line py-2">
              <dt className="text-xs uppercase tracking-wide text-ink/55">Participantes</dt>
              <dd className="mt-1 text-[15px] font-semibold">{entrada.participantes}</dd>
            </div>
          </dl>

          <ul className="mt-6 flex flex-wrap gap-2">
            {entrada.categorias.map((c) => (
              <li key={c}>
                <span className="tag">{c}</span>
              </li>
            ))}
          </ul>

          {entrada.pdf && (
            <a href={entrada.pdf} className="pill pill-dark mt-8 gap-2 px-6 py-3">
              <IconoDocumento className="h-5 w-5" />
              Descargar PDF
            </a>
          )}

          <div className="mt-12">
            {entrada.contenido.map((p, i) => (
              <p key={i} className="mb-6 text-[15px] leading-[1.75] text-ink/85">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

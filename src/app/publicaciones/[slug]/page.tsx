import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Marcador from "@/components/Marcador";
import { IconoDocumento } from "@/components/Iconos";
import { buscarPublicacion, publicaciones } from "@/data/publicaciones";

export function generateStaticParams() {
  return publicaciones.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: buscarPublicacion(slug)?.titulo ?? "Recurso" };
}

/** N2 - Recurso */
export default async function PaginaRecurso({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recurso = buscarPublicacion(slug);
  if (!recurso) notFound();

  const datos: [string, string][] = [
    ["Lab", recurso.lab],
    ["Autores", recurso.autores],
    ["Año de publicación", recurso.anio],
    ["Número de páginas", recurso.paginas],
  ];

  return (
    <article className="bg-cream pb-20">
      <div className="shell pt-12">
        <h1 className="display t-h1 max-w-[18ch]">{recurso.titulo}</h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr]">
          <Marcador etiqueta="Imagen" className="aspect-[4/3] w-full rounded-xl" />

          <div className="self-center">
            <dl>
              {datos.map(([clave, valor]) => (
                <div key={clave} className="border-b border-line py-3">
                  <dt className="text-xs uppercase tracking-wide text-ink/55">{clave}</dt>
                  <dd className="mt-1 text-[15px] font-semibold">{valor}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-6 flex flex-wrap gap-2">
              {recurso.categorias.map((c) => (
                <li key={c}>
                  <span className="tag">{c}</span>
                </li>
              ))}
            </ul>

            <a href={recurso.pdf} className="pill pill-dark mt-8 gap-2 px-6 py-3">
              <IconoDocumento className="h-5 w-5" />
              Descargar PDF
            </a>
          </div>
        </div>

        <div className="mt-14 max-w-4xl">
          {recurso.contenido.map((p, i) => (
            <p key={i} className="mb-6 text-[15px] leading-[1.75] text-ink/85">
              {p}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

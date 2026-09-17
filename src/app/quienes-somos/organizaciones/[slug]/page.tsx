import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Marcador from "@/components/Marcador";
import { buscarOrganizacion, organizaciones } from "@/data/organizaciones";

export function generateStaticParams() {
  return organizaciones.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: buscarOrganizacion(slug)?.nombre ?? "Organización" };
}

/** N2 - Organizaciones */
export default async function FichaOrganizacion({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = buscarOrganizacion(slug);
  if (!org) notFound();

  const datos: [string, string][] = [
    ["Región", org.region],
    ["Página web", org.web],
    ["Correo electrónico", org.correo],
  ];

  return (
    <article className="bg-cream pb-20">
      <div className="shell pt-12">
        <h1 className="display t-h1">{org.nombre}</h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <Marcador etiqueta="[Logo]" className="aspect-[16/10] w-full rounded-xl" />

          <dl className="self-center">
            {datos.map(([clave, valor]) => (
              <div key={clave} className="border-b border-line py-4">
                <dt className="text-xs uppercase tracking-wide text-ink/55">{clave}</dt>
                <dd className="mt-1 text-[15px] font-semibold">{valor}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-14 max-w-4xl">
          {org.descripcion.map((p, i) => (
            <p key={i} className="mb-6 text-[15px] leading-[1.75] text-ink/85">
              {p}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

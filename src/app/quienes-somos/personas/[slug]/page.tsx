import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Marcador from "@/components/Marcador";
import { buscarPersona, personas } from "@/data/personas";

export function generateStaticParams() {
  return personas.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: buscarPersona(slug)?.nombre ?? "Persona" };
}

/** N2 - Personas */
export default async function FichaPersona({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const persona = buscarPersona(slug);
  if (!persona) notFound();

  const datos: [string, string][] = [
    ["Organización", persona.organizacion],
    ["Rol", persona.rol],
    ["Región", persona.region],
    ["Afiliación", persona.afiliacion],
    ["Correo electrónico", persona.correo],
  ];

  return (
    <article className="bg-cream pb-20">
      <div className="shell pt-12">
        <h1 className="display t-h1">{persona.nombre}</h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <Marcador etiqueta="[Foto]" className="aspect-[4/3] w-full rounded-xl" />

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
          {persona.biografia.map((p, i) => (
            <p key={i} className="mb-6 text-[15px] leading-[1.75] text-ink/85">
              {p}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}

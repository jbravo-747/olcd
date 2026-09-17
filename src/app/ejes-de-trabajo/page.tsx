import type { Metadata } from "next";
import Link from "next/link";
import EncabezadoPagina from "@/components/EncabezadoPagina";
import Marcador from "@/components/Marcador";
import { labs } from "@/data/labs";

export const metadata: Metadata = { title: "Ejes de trabajo" };

const intro =
  "[Descripción corta] Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam sodales orci in neque euismod rhoncus. Donec tellus orci, eleifend eu posuere in, aliquam vel erat. Suspendisse condimentum mauris tincidunt leo eleifend porta rhoncus sed risus. Mauris enim ex, dignissim non congue eget, vestibulum sit amet ex.";

/** N1 - Ejes de trabajo */
export default function EjesDeTrabajo() {
  return (
    <>
      <EncabezadoPagina titulo="Ejes de trabajo" descripcion={intro} alto="alto" />

      <div className="bg-cream py-16">
        <div className="shell space-y-6">
          {labs.map((lab, i) => (
            <article
              key={lab.slug}
              className={`grid items-center gap-8 overflow-hidden rounded-xl bg-cream-deep lg:grid-cols-2 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <Marcador etiqueta="[Imagen]" className="h-full min-h-[280px] w-full" />
              <div className="p-8 lg:p-12">
                <h2 className="display text-3xl">{lab.nombre}</h2>
                <p className="mt-5 text-[15px] leading-relaxed text-ink/80">{lab.descripcion}</p>
                <Link href={`/ejes-de-trabajo/${lab.slug}`} className="pill pill-dark mt-7">
                  Leer más
                  <span className="sr-only"> sobre {lab.nombre}</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

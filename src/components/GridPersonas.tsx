"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Media } from "@/payload-types";
import { Link } from "@/i18n/navigation";
import Imagen from "./Imagen";
import Paginacion from "./Paginacion";

export type FichaPersona = {
  slug: string;
  nombre: string;
  titulo: string;
  organizacion: string;
  foto?: Media | null;
};

export default function GridPersonas({
  personas,
  porPagina = 12,
  etiquetaPaginacion,
}: {
  personas: FichaPersona[];
  porPagina?: number;
  etiquetaPaginacion?: string;
}) {
  const t = useTranslations("comun");
  const [pagina, setPagina] = useState(1);
  const totalPaginas = Math.ceil(personas.length / porPagina);
  const visibles = personas.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {visibles.map((persona) => (
          <li key={persona.slug} className="text-center">
            <Imagen
              media={persona.foto}
              etiqueta="[Foto]"
              className="mx-auto aspect-square w-full rounded-lg"
              sizes="(min-width: 1024px) 280px, 50vw"
            />
            <h3 className="mt-4 text-base font-bold">{persona.nombre}</h3>
            <p className="text-[13px] text-ink/75">{persona.titulo}</p>
            <p className="text-[13px] text-ink/60">{persona.organizacion}</p>
            <Link href={`/quienes-somos/personas/${persona.slug}`} className="pill pill-dark mt-4">
              {t("leerMas")}
              <span className="sr-only"> {t("sobre", { titulo: persona.nombre })}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Paginacion
        pagina={pagina}
        total={totalPaginas}
        onCambio={setPagina}
        etiqueta={etiquetaPaginacion ?? t("paginacion")}
      />
    </div>
  );
}

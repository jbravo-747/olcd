"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Proyecto } from "@/payload-types";
import TextoEnriquecido from "./TextoEnriquecido";
import { IconoChevron } from "./Iconos";

export type Seccion = NonNullable<Proyecto["secciones"]>[number];

function idDe(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Cuerpo de las páginas de proyecto: índice lateral desplegable + contenido
 * (N3 - Proyectos lab).
 */
export default function SeccionesDesplegables({ secciones }: { secciones: Seccion[] }) {
  const t = useTranslations("proyecto");
  const [abiertas, setAbiertas] = useState<string[]>(secciones.map((s) => s.titulo));

  const alternar = (titulo: string) =>
    setAbiertas((prev) => (prev.includes(titulo) ? prev.filter((x) => x !== titulo) : [...prev, titulo]));

  return (
    <div className="bg-paper">
      <div className="shell grid gap-10 py-14 lg:grid-cols-[240px_1fr] lg:gap-16">
        {/* Índice */}
        <nav aria-label={t("contenido")} className="lg:sticky lg:top-24 lg:self-start">
          {secciones.map((seccion) => (
            <div key={seccion.id ?? seccion.titulo} className="mb-4">
              <button
                type="button"
                onClick={() => alternar(seccion.titulo)}
                aria-expanded={abiertas.includes(seccion.titulo)}
                className="flex w-full items-center justify-between gap-2 text-left text-[13px] font-bold"
              >
                {seccion.titulo}
                <IconoChevron
                  className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                    abiertas.includes(seccion.titulo) ? "rotate-180" : ""
                  }`}
                />
              </button>
              {abiertas.includes(seccion.titulo) && (seccion.subsecciones?.length ?? 0) > 0 && (
                <ul className="mt-2 space-y-1.5 pl-3">
                  {seccion.subsecciones?.map((sub) => (
                    <li key={sub.id ?? sub.titulo}>
                      <a href={`#${idDe(sub.titulo)}`} className="text-[13px] text-ink/50 hover:text-ink">
                        {sub.titulo}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        {/* Contenido */}
        <div className="max-w-3xl">
          {secciones.map((seccion) => (
            <section key={seccion.id ?? seccion.titulo} id={idDe(seccion.titulo)} className="mb-14 scroll-mt-24">
              <h2 className="display text-3xl">{seccion.titulo}</h2>
              <TextoEnriquecido datos={seccion.cuerpo} className="mt-5" />

              {seccion.subsecciones?.map((sub) => (
                <div key={sub.id ?? sub.titulo} id={idDe(sub.titulo)} className="mt-12 scroll-mt-24">
                  <h3 className="display text-2xl">{sub.titulo}</h3>
                  <TextoEnriquecido datos={sub.cuerpo} className="mt-5" />
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

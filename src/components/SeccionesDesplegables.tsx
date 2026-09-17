"use client";

import { useState } from "react";
import { IconoChevron } from "./Iconos";

export type Seccion = {
  titulo: string;
  parrafos: string[];
  subsecciones: { titulo: string; parrafos: string[] }[];
};

function id(texto: string) {
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
  const [abiertas, setAbiertas] = useState<string[]>(secciones.map((s) => s.titulo));

  const alternar = (titulo: string) =>
    setAbiertas((prev) => (prev.includes(titulo) ? prev.filter((t) => t !== titulo) : [...prev, titulo]));

  return (
    <div className="bg-paper">
      <div className="shell grid gap-10 py-14 lg:grid-cols-[240px_1fr] lg:gap-16">
        {/* Índice */}
        <nav aria-label="Contenido del proyecto" className="lg:sticky lg:top-24 lg:self-start">
          {secciones.map((seccion) => (
            <div key={seccion.titulo} className="mb-4">
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
              {abiertas.includes(seccion.titulo) && (
                <ul className="mt-2 space-y-1.5 pl-3">
                  {seccion.subsecciones.map((sub) => (
                    <li key={sub.titulo}>
                      <a href={`#${id(sub.titulo)}`} className="text-[13px] text-ink/50 hover:text-ink">
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
            <section key={seccion.titulo} id={id(seccion.titulo)} className="mb-14 scroll-mt-24">
              <h2 className="display text-3xl">{seccion.titulo}</h2>
              {seccion.parrafos.map((p, i) => (
                <p key={i} className="mt-5 text-[15px] leading-[1.75] text-ink/85">
                  {p}
                </p>
              ))}

              {seccion.subsecciones.map((sub) => (
                <div key={sub.titulo} id={id(sub.titulo)} className="mt-12 scroll-mt-24">
                  <h3 className="display text-2xl">{sub.titulo}</h3>
                  {sub.parrafos.map((p, i) => (
                    <p key={i} className="mt-5 text-[15px] leading-[1.75] text-ink/85">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

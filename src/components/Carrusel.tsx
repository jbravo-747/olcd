"use client";

import { useState } from "react";
import { IconoFlecha } from "./Iconos";

/** Carrusel de fotos del detalle de proyecto (marcadores en la maqueta). */
export default function Carrusel({ fotos = 4, etiqueta = "[Carrusel de fotos]" }: { fotos?: number; etiqueta?: string }) {
  const [indice, setIndice] = useState(0);
  const mover = (delta: number) => setIndice((i) => (i + delta + fotos) % fotos);

  return (
    <section aria-roledescription="carrusel" aria-label="Galería del proyecto" className="relative bg-slate">
      <div className="flex h-[320px] items-center justify-center text-cream/85 sm:h-[420px]">
        <p className="text-center text-sm font-semibold">
          {etiqueta}
          <span className="mt-2 block text-xs font-normal text-cream/60">
            Imagen {indice + 1} de {fotos}
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => mover(-1)}
        aria-label="Imagen anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-cream transition-colors hover:bg-white/15"
      >
        <IconoFlecha className="h-7 w-7 rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => mover(1)}
        aria-label="Imagen siguiente"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-cream transition-colors hover:bg-white/15"
      >
        <IconoFlecha className="h-7 w-7" />
      </button>

      <ul className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
        {Array.from({ length: fotos }, (_, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === indice}
              className={`h-2 w-2 rounded-full transition-colors ${i === indice ? "bg-cream" : "bg-cream/40"}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

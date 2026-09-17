"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Media } from "@/payload-types";
import Imagen from "./Imagen";
import { IconoFlecha } from "./Iconos";

/** Carrusel de fotos del detalle de proyecto o entrada. Sin fotos muestra un marcador. */
export default function Carrusel({ fotos }: { fotos: Media[] }) {
  const t = useTranslations("carrusel");
  const [indice, setIndice] = useState(0);
  const total = fotos.length;
  const mover = (delta: number) => setIndice((i) => (i + delta + total) % total);

  if (total === 0) {
    return (
      <section className="bg-slate">
        <div className="flex h-[320px] items-center justify-center text-cream/85 sm:h-[420px]">
          <p className="text-sm font-semibold">{t("galeria")}</p>
        </div>
      </section>
    );
  }

  return (
    <section aria-roledescription="carrusel" aria-label={t("galeria")} className="relative bg-slate">
      <div className="relative h-[320px] sm:h-[420px]">
        <Imagen
          media={fotos[indice]}
          tamano="hero"
          className="h-full w-full"
          sizes="100vw"
          priority={indice === 0}
        />
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs text-cream/80">
          {t("imagenDe", { actual: indice + 1, total })}
        </p>
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label={t("anterior")}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-ink/30 p-2 text-cream transition-colors hover:bg-ink/60"
          >
            <IconoFlecha className="h-7 w-7 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            aria-label={t("siguiente")}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-ink/30 p-2 text-cream transition-colors hover:bg-ink/60"
          >
            <IconoFlecha className="h-7 w-7" />
          </button>

          <ul className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {fotos.map((foto, i) => (
              <li key={foto.id}>
                <button
                  type="button"
                  onClick={() => setIndice(i)}
                  aria-label={t("verImagen", { n: i + 1 })}
                  aria-current={i === indice}
                  className={`h-2 w-2 rounded-full transition-colors ${i === indice ? "bg-cream" : "bg-cream/40"}`}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

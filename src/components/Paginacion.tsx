"use client";

import { IconoFlecha } from "./Iconos";

export default function Paginacion({
  pagina,
  total,
  onCambio,
  etiqueta = "Paginación",
}: {
  pagina: number;
  total: number;
  onCambio: (p: number) => void;
  etiqueta?: string;
}) {
  if (total <= 1) return null;

  return (
    <nav aria-label={etiqueta} className="mt-10 inline-flex items-center gap-1 rounded-full bg-cream p-1.5 shadow-sm">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onCambio(n)}
          aria-current={n === pagina ? "page" : undefined}
          aria-label={`Página ${n}`}
          className={`h-9 w-9 rounded-full text-sm font-semibold transition-colors ${
            n === pagina ? "bg-ink text-cream" : "text-ink hover:bg-ink/10"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onCambio(Math.min(total, pagina + 1))}
        disabled={pagina === total}
        aria-label="Página siguiente"
        className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/10 disabled:opacity-30"
      >
        <IconoFlecha className="h-4 w-4" />
      </button>
    </nav>
  );
}

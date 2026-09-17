import { Link } from "@/i18n/navigation";
import { IconoFlecha } from "./Iconos";

/** Paginación por enlaces (sin JS), para listados renderizados en servidor. */
export default function PaginacionEnlaces({
  pagina,
  total,
  href,
  etiqueta,
  etiquetaPagina,
  etiquetaSiguiente,
}: {
  pagina: number;
  total: number;
  href: (n: number) => string;
  etiqueta: string;
  etiquetaPagina: (n: number) => string;
  etiquetaSiguiente: string;
}) {
  if (total <= 1) return null;

  return (
    <nav aria-label={etiqueta} className="mt-10 inline-flex items-center gap-1 rounded-full bg-cream p-1.5 shadow-sm">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === pagina ? "page" : undefined}
          aria-label={etiquetaPagina(n)}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
            n === pagina ? "bg-ink text-cream" : "text-ink hover:bg-ink/10"
          }`}
        >
          {n}
        </Link>
      ))}
      {pagina < total ? (
        <Link
          href={href(pagina + 1)}
          aria-label={etiquetaSiguiente}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/10"
        >
          <IconoFlecha className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full text-ink opacity-30">
          <IconoFlecha className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
